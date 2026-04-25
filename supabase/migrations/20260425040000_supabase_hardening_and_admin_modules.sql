-- Security and schema hardening for production admin/public flows

-- Remove temporary permissive policies from legacy schema
DROP POLICY IF EXISTS "TEMP public read estimates" ON public.estimate_requests;
DROP POLICY IF EXISTS "TEMP public update estimates" ON public.estimate_requests;
DROP POLICY IF EXISTS "TEMP public delete estimates" ON public.estimate_requests;
DROP POLICY IF EXISTS "TEMP public manage pricing rules" ON public.pricing_rules;
DROP POLICY IF EXISTS "TEMP public manage customers" ON public.customers;
DROP POLICY IF EXISTS "TEMP public manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "TEMP public manage portfolio" ON public.portfolio_items;
DROP POLICY IF EXISTS "TEMP public manage services" ON public.services;
DROP POLICY IF EXISTS "TEMP public manage media assets" ON public.media_assets;
DROP POLICY IF EXISTS "TEMP public manage messages" ON public.messages;
DROP POLICY IF EXISTS "TEMP public manage media objects" ON storage.objects;

-- Ensure core helper exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Required module tables
CREATE TABLE IF NOT EXISTS public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  full_name text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  service_type text,
  bedrooms text,
  bathrooms text,
  square_feet integer,
  preferred_date date,
  preferred_time text,
  frequency text,
  estimated_price numeric(10,2),
  status text NOT NULL DEFAULT 'new_request',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cleaners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  status text NOT NULL DEFAULT 'active',
  availability text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  service_request_id uuid REFERENCES public.service_requests(id) ON DELETE SET NULL,
  cleaner_id uuid REFERENCES public.cleaners(id) ON DELETE SET NULL,
  scheduled_date date,
  scheduled_time text,
  price numeric(10,2),
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.areas_we_serve (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  state text NOT NULL,
  zip_codes text,
  radius_miles numeric(5,2),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  is_featured boolean NOT NULL DEFAULT false,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.portfolio_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  category text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Make existing tables satisfy requested minimum fields
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.pricing_rules
  ADD COLUMN IF NOT EXISTS service_type text,
  ADD COLUMN IF NOT EXISTS base_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS bedroom_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS bathroom_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS square_feet_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS frequency_discount numeric(10,4),
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS business_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS tiktok_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- Ensure triggers for updated_at fields
DROP TRIGGER IF EXISTS trg_service_requests_updated_at ON public.service_requests;
CREATE TRIGGER trg_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_cleaners_updated_at ON public.cleaners;
CREATE TRIGGER trg_cleaners_updated_at
BEFORE UPDATE ON public.cleaners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.bookings;
CREATE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_areas_we_serve_updated_at ON public.areas_we_serve;
CREATE TRIGGER trg_areas_we_serve_updated_at
BEFORE UPDATE ON public.areas_we_serve
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER trg_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.reviews;
CREATE TRIGGER trg_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_portfolio_images_updated_at ON public.portfolio_images;
CREATE TRIGGER trg_portfolio_images_updated_at
BEFORE UPDATE ON public.portfolio_images
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_customers_updated_at_v2 ON public.customers;
CREATE TRIGGER trg_customers_updated_at_v2
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill fields from legacy key/value settings
UPDATE public.site_settings SET business_name = setting_value WHERE setting_key = 'company_name' AND business_name IS NULL;
UPDATE public.site_settings SET phone = setting_value WHERE setting_key = 'phone' AND phone IS NULL;
UPDATE public.site_settings SET email = setting_value WHERE setting_key = 'email' AND email IS NULL;
UPDATE public.site_settings SET address = setting_value WHERE setting_key = 'address_line_1' AND address IS NULL;
UPDATE public.site_settings SET facebook_url = setting_value WHERE setting_key = 'social_facebook' AND facebook_url IS NULL;
UPDATE public.site_settings SET instagram_url = setting_value WHERE setting_key = 'social_instagram' AND instagram_url IS NULL;
UPDATE public.site_settings SET tiktok_url = setting_value WHERE setting_key = 'social_tiktok' AND tiktok_url IS NULL;
UPDATE public.site_settings SET linkedin_url = setting_value WHERE setting_key = 'social_linkedin' AND linkedin_url IS NULL;
UPDATE public.site_settings SET whatsapp_number = setting_value WHERE setting_key = 'social_whatsapp' AND whatsapp_number IS NULL;

-- Keep requested contact values synchronized
UPDATE public.site_settings SET setting_value = '(978) 319-8939' WHERE setting_key = 'phone';
UPDATE public.site_settings SET setting_value = 'paivacleaners@gmail.com' WHERE setting_key = 'email';
UPDATE public.site_settings SET phone = '(978) 319-8939' WHERE phone IS DISTINCT FROM '(978) 319-8939';
UPDATE public.site_settings SET email = 'paivacleaners@gmail.com' WHERE email IS DISTINCT FROM 'paivacleaners@gmail.com';

-- Enable RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas_we_serve ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

-- service_requests policies
DROP POLICY IF EXISTS "Visitors can insert service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins manage service requests" ON public.service_requests;
CREATE POLICY "Visitors can insert service requests"
  ON public.service_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Admins manage service requests"
  ON public.service_requests FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- public read policies
DROP POLICY IF EXISTS "Public can read active areas we serve" ON public.areas_we_serve;
CREATE POLICY "Public can read active areas we serve"
  ON public.areas_we_serve FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can read public reviews" ON public.reviews;
CREATE POLICY "Public can read public reviews"
  ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

DROP POLICY IF EXISTS "Public can read public portfolio images" ON public.portfolio_images;
CREATE POLICY "Public can read public portfolio images"
  ON public.portfolio_images FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

-- admin-only management policies
DROP POLICY IF EXISTS "Admins manage bookings" ON public.bookings;
CREATE POLICY "Admins manage bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage cleaners" ON public.cleaners;
CREATE POLICY "Admins manage cleaners"
  ON public.cleaners FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage admin users" ON public.admin_users;
CREATE POLICY "Admins manage admin users"
  ON public.admin_users FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage areas we serve" ON public.areas_we_serve;
CREATE POLICY "Admins manage areas we serve"
  ON public.areas_we_serve FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage reviews" ON public.reviews;
CREATE POLICY "Admins manage reviews"
  ON public.reviews FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage portfolio images" ON public.portfolio_images;
CREATE POLICY "Admins manage portfolio images"
  ON public.portfolio_images FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Restrict site settings read to basic categories only for public users
DROP POLICY IF EXISTS "Site settings publicly readable" ON public.site_settings;
CREATE POLICY "Site settings basic public read"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (category IN ('company', 'contact', 'social', 'header', 'footer'));

-- Keep admin full control over legacy tables
DROP POLICY IF EXISTS "Admins manage site settings" ON public.site_settings;
CREATE POLICY "Admins manage site settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tighten storage policy to admin-only writes
DROP POLICY IF EXISTS "Public can read media objects" ON storage.objects;
CREATE POLICY "Public can read media objects"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media');

CREATE POLICY "Admins can manage media objects"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- Sync legacy estimate_requests -> service_requests to keep admin/public modules in sync
CREATE OR REPLACE FUNCTION public.sync_estimate_to_service_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id uuid;
BEGIN
  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE lower(coalesce(email, '')) = lower(coalesce(NEW.email, ''))
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    INSERT INTO public.customers (full_name, email, phone, address, city, state, zip_code, notes)
    VALUES (NEW.full_name, NEW.email, NEW.phone, NEW.address, NEW.city, NULL, NEW.zip_code, NEW.notes)
    RETURNING id INTO v_customer_id;
  END IF;

  INSERT INTO public.service_requests (
    customer_id, full_name, email, phone, address, city, state, zip_code,
    service_type, bedrooms, bathrooms, preferred_date, preferred_time, frequency,
    estimated_price, status, notes
  )
  VALUES (
    v_customer_id, NEW.full_name, NEW.email, NEW.phone, NEW.address, NEW.city, NULL, NEW.zip_code,
    NEW.service_type, NEW.bedrooms, NEW.bathrooms, NEW.preferred_date, NEW.preferred_time, NEW.frequency,
    NEW.calculated_estimate, NEW.status::text, NEW.notes
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS estimate_requests_sync_service_requests ON public.estimate_requests;
CREATE TRIGGER estimate_requests_sync_service_requests
AFTER INSERT ON public.estimate_requests
FOR EACH ROW
EXECUTE FUNCTION public.sync_estimate_to_service_request();
