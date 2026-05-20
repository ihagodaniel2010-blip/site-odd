-- Consolidated table consistency migration
-- Focus: schema alignment, RLS hardening, compatibility backfills, safe seeds

-- ------------------------------------------------------------
-- Core helpers and role model
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'app_role' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------
-- Canonical tables
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  full_name text,
  email text,
  phone text,
  city text,
  zip_code text,
  service_type text,
  home_size text,
  frequency text,
  bedrooms integer,
  bathrooms numeric,
  extras jsonb,
  estimated_price_min numeric,
  estimated_price_max numeric,
  status text NOT NULL DEFAULT 'new',
  notes text,
  preferred_date date,
  preferred_time text,
  address text,
  property_type text,
  calculated_estimate numeric,
  estimate_breakdown jsonb,
  service_zone text,
  admin_notes text,
  contacted_via text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS zip_code text,
  ADD COLUMN IF NOT EXISTS service_type text,
  ADD COLUMN IF NOT EXISTS home_size text,
  ADD COLUMN IF NOT EXISTS frequency text,
  ADD COLUMN IF NOT EXISTS bedrooms integer,
  ADD COLUMN IF NOT EXISTS bathrooms numeric,
  ADD COLUMN IF NOT EXISTS extras jsonb,
  ADD COLUMN IF NOT EXISTS estimated_price_min numeric,
  ADD COLUMN IF NOT EXISTS estimated_price_max numeric,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS preferred_date date,
  ADD COLUMN IF NOT EXISTS preferred_time text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS property_type text,
  ADD COLUMN IF NOT EXISTS calculated_estimate numeric,
  ADD COLUMN IF NOT EXISTS estimate_breakdown jsonb,
  ADD COLUMN IF NOT EXISTS service_zone text,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS contacted_via text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'service_requests' AND column_name = 'estimated_price'
  ) THEN
    EXECUTE 'UPDATE public.service_requests
             SET estimated_price_min = COALESCE(estimated_price_min, estimated_price),
                 estimated_price_max = COALESCE(estimated_price_max, estimated_price)
             WHERE estimated_price IS NOT NULL';
  END IF;
END
$$;

ALTER TABLE public.service_requests
  ALTER COLUMN status SET DEFAULT 'new';

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text,
  phone text,
  city text,
  zip_code text,
  notes text,
  name text,
  address text,
  status text NOT NULL DEFAULT 'active',
  last_service_date date,
  total_spent numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS zip_code text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_service_date date,
  ADD COLUMN IF NOT EXISTS total_spent numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.customers
SET full_name = COALESCE(full_name, name),
    name = COALESCE(name, full_name)
WHERE true;

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  service_request_id uuid REFERENCES public.service_requests(id) ON DELETE SET NULL,
  cleaner_id uuid REFERENCES public.cleaners(id) ON DELETE SET NULL,
  scheduled_date date,
  scheduled_time text,
  price numeric,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_request_id uuid REFERENCES public.service_requests(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cleaner_id uuid REFERENCES public.cleaners(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS scheduled_date date,
  ADD COLUMN IF NOT EXISTS scheduled_time text,
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.cleaners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text,
  phone text,
  status text NOT NULL DEFAULT 'active',
  availability jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cleaners
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS availability jsonb,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.areas_served (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  state text NOT NULL DEFAULT 'MA',
  zip_codes text[] NOT NULL DEFAULT '{}',
  zone text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.areas_served
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT 'MA',
  ADD COLUMN IF NOT EXISTS zip_codes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS zone text,
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
DECLARE
  zone_expr text;
  display_order_expr text;
  active_expr text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'areas_we_serve'
  ) THEN
    zone_expr := CASE
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'areas_we_serve' AND column_name = 'zone'
      ) THEN 'COALESCE(a.zone, ''regular'')'
      ELSE '''regular'''
    END;

    display_order_expr := CASE
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'areas_we_serve' AND column_name = 'display_order'
      ) THEN 'COALESCE(a.display_order, 0)'
      ELSE '0'
    END;

    active_expr := CASE
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'areas_we_serve' AND column_name = 'active'
      ) THEN 'COALESCE(a.active, true)'
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'areas_we_serve' AND column_name = 'is_active'
      ) THEN 'COALESCE(a.is_active, true)'
      ELSE 'true'
    END;

    EXECUTE format(
      'INSERT INTO public.areas_served (city, state, zone, display_order, active)
       SELECT a.city, COALESCE(a.state, ''MA''), %s, %s, %s
       FROM public.areas_we_serve a
       WHERE NOT EXISTS (
         SELECT 1 FROM public.areas_served s
         WHERE lower(s.city) = lower(a.city)
       )',
      zone_expr,
      display_order_expr,
      active_expr
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text,
  base_price numeric,
  home_size text,
  home_size_price numeric,
  bedroom_price numeric,
  bathroom_price numeric,
  frequency_type text,
  frequency_discount_percent numeric,
  extra_key text,
  extra_label text,
  extra_price numeric,
  is_active boolean NOT NULL DEFAULT true,
  category text,
  name text,
  label text,
  value numeric NOT NULL DEFAULT 0,
  value_type text NOT NULL DEFAULT 'fixed_amount',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_rules
  ADD COLUMN IF NOT EXISTS service_type text,
  ADD COLUMN IF NOT EXISTS base_price numeric,
  ADD COLUMN IF NOT EXISTS home_size text,
  ADD COLUMN IF NOT EXISTS home_size_price numeric,
  ADD COLUMN IF NOT EXISTS bedroom_price numeric,
  ADD COLUMN IF NOT EXISTS bathroom_price numeric,
  ADD COLUMN IF NOT EXISTS frequency_type text,
  ADD COLUMN IF NOT EXISTS frequency_discount_percent numeric,
  ADD COLUMN IF NOT EXISTS extra_key text,
  ADD COLUMN IF NOT EXISTS extra_label text,
  ADD COLUMN IF NOT EXISTS extra_price numeric,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS label text,
  ADD COLUMN IF NOT EXISTS value numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS value_type text NOT NULL DEFAULT 'fixed_amount',
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pricing_rules_category_name_key'
  ) THEN
    ALTER TABLE public.pricing_rules
    ADD CONSTRAINT pricing_rules_category_name_key UNIQUE (category, name);
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb,
  setting_type text NOT NULL DEFAULT 'text',
  category text NOT NULL DEFAULT 'general',
  label text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS setting_key text,
  ADD COLUMN IF NOT EXISTS setting_value jsonb,
  ADD COLUMN IF NOT EXISTS setting_type text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS label text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'setting_value'
      AND data_type <> 'jsonb'
  ) THEN
    EXECUTE 'ALTER TABLE public.site_settings
             ALTER COLUMN setting_value TYPE jsonb
             USING CASE
               WHEN setting_value IS NULL THEN NULL
               ELSE to_jsonb(setting_value::text)
             END';
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text,
  rating integer,
  review_text text,
  is_public boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  anonymize_name boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS rating integer,
  ADD COLUMN IF NOT EXISTS review_text text,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS anonymize_name boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  category text,
  room text,
  before_image_url text,
  after_image_url text,
  is_public boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_items
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS room text,
  ADD COLUMN IF NOT EXISTS before_image_url text,
  ADD COLUMN IF NOT EXISTS after_image_url text,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.portfolio_items
SET room = COALESCE(room, location, 'Other'),
    before_image_url = COALESCE(before_image_url, image_url),
    after_image_url = COALESCE(after_image_url, image_url),
    is_public = COALESCE(is_public, active, true),
    is_featured = COALESCE(is_featured, featured, false)
WHERE true;

CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  file_name text,
  file_url text,
  file_type text,
  section text,
  alt_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS file_type text,
  ADD COLUMN IF NOT EXISTS section text,
  ADD COLUMN IF NOT EXISTS alt_text text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.media_assets
SET title = COALESCE(title, file_name)
WHERE title IS NULL;

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text,
  phone text,
  subject text,
  message text,
  status text NOT NULL DEFAULT 'new',
  estimate_request_id uuid,
  client_name text,
  channel text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS estimate_request_id uuid,
  ADD COLUMN IF NOT EXISTS client_name text,
  ADD COLUMN IF NOT EXISTS channel text,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.messages
SET full_name = COALESCE(full_name, client_name),
    client_name = COALESCE(client_name, full_name)
WHERE true;

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  starting_price numeric NOT NULL DEFAULT 0,
  image_url text,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS starting_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Compatibility backfill from legacy estimate_requests
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'estimate_requests'
  ) THEN
    INSERT INTO public.service_requests (
      id,
      full_name,
      email,
      phone,
      city,
      zip_code,
      service_type,
      home_size,
      frequency,
      bedrooms,
      bathrooms,
      extras,
      estimated_price_min,
      estimated_price_max,
      status,
      notes,
      preferred_date,
      preferred_time,
      address,
      property_type,
      calculated_estimate,
      estimate_breakdown,
      service_zone,
      admin_notes,
      contacted_via,
      created_at,
      updated_at
    )
    SELECT
      e.id,
      e.full_name,
      e.email,
      e.phone,
      e.city,
      e.zip_code,
      e.service_type,
      COALESCE(e.bedrooms, ''),
      e.frequency,
      NULLIF(regexp_replace(COALESCE(e.bedrooms, ''), '[^0-9]', '', 'g'), '')::integer,
      NULLIF(regexp_replace(COALESCE(e.bathrooms, ''), '[^0-9\.]', '', 'g'), '')::numeric,
      CASE
        WHEN jsonb_typeof(e.estimate_breakdown) = 'object' THEN COALESCE(e.estimate_breakdown -> 'extras_selected', '[]'::jsonb)
        ELSE '[]'::jsonb
      END,
      e.calculated_estimate,
      e.calculated_estimate,
      COALESCE(NULLIF(e.status::text, ''), 'new'),
      e.notes,
      e.preferred_date,
      e.preferred_time,
      e.address,
      e.property_type,
      e.calculated_estimate,
      e.estimate_breakdown,
      e.service_zone,
      e.admin_notes,
      e.contacted_via,
      e.created_at,
      e.updated_at
    FROM public.estimate_requests e
    ON CONFLICT (id) DO NOTHING;
  END IF;
END
$$;

-- ------------------------------------------------------------
-- updated_at triggers
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS set_service_requests_updated_at ON public.service_requests;
CREATE TRIGGER set_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.bookings;
CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_cleaners_updated_at ON public.cleaners;
CREATE TRIGGER set_cleaners_updated_at
  BEFORE UPDATE ON public.cleaners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_areas_served_updated_at ON public.areas_served;
CREATE TRIGGER set_areas_served_updated_at
  BEFORE UPDATE ON public.areas_served
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_pricing_rules_updated_at ON public.pricing_rules;
CREATE TRIGGER set_pricing_rules_updated_at
  BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_reviews_updated_at ON public.reviews;
CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_portfolio_items_updated_at ON public.portfolio_items;
CREATE TRIGGER set_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_media_assets_updated_at ON public.media_assets;
CREATE TRIGGER set_media_assets_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_messages_updated_at ON public.messages;
CREATE TRIGGER set_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_services_updated_at ON public.services;
CREATE TRIGGER set_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER set_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------
-- RLS and policies
-- ------------------------------------------------------------
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas_served ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Visitors can insert service requests" ON public.service_requests;
CREATE POLICY "Visitors can insert service requests"
  ON public.service_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage service requests" ON public.service_requests;
CREATE POLICY "Admins manage service requests"
  ON public.service_requests FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public can read areas served" ON public.areas_served;
CREATE POLICY "Public can read areas served"
  ON public.areas_served FOR SELECT
  TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Public can read public reviews" ON public.reviews;
CREATE POLICY "Public can read public reviews"
  ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

DROP POLICY IF EXISTS "Public can read public portfolio" ON public.portfolio_items;
CREATE POLICY "Public can read public portfolio"
  ON public.portfolio_items FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

DROP POLICY IF EXISTS "Public can read pricing rules" ON public.pricing_rules;
CREATE POLICY "Public can read pricing rules"
  ON public.pricing_rules FOR SELECT
  TO anon, authenticated
  USING (COALESCE(is_active, active, true));

DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
CREATE POLICY "Public can read site settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (category IN ('company', 'contact', 'social', 'header', 'footer'));

DROP POLICY IF EXISTS "Visitors can insert messages" ON public.messages;
CREATE POLICY "Visitors can insert messages"
  ON public.messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage customers" ON public.customers;
CREATE POLICY "Admins manage customers"
  ON public.customers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

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

DROP POLICY IF EXISTS "Admins manage areas served" ON public.areas_served;
CREATE POLICY "Admins manage areas served"
  ON public.areas_served FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage pricing rules" ON public.pricing_rules;
CREATE POLICY "Admins manage pricing rules"
  ON public.pricing_rules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage site settings" ON public.site_settings;
CREATE POLICY "Admins manage site settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage reviews" ON public.reviews;
CREATE POLICY "Admins manage reviews"
  ON public.reviews FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage portfolio items" ON public.portfolio_items;
CREATE POLICY "Admins manage portfolio items"
  ON public.portfolio_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage media assets" ON public.media_assets;
CREATE POLICY "Admins manage media assets"
  ON public.media_assets FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage messages" ON public.messages;
CREATE POLICY "Admins manage messages"
  ON public.messages FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage services" ON public.services;
CREATE POLICY "Admins manage services"
  ON public.services FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage admin users" ON public.admin_users;
CREATE POLICY "Admins manage admin users"
  ON public.admin_users FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ------------------------------------------------------------
-- Safe upsert seeds
-- ------------------------------------------------------------
INSERT INTO public.areas_served (city, state, zone, zip_codes, display_order, active)
VALUES
  ('Lowell', 'MA', 'regular', ARRAY['01850','01851','01852','01854'], 1, true),
  ('Chelmsford', 'MA', 'regular', ARRAY['01824'], 2, true),
  ('Dracut', 'MA', 'regular', ARRAY['01826'], 3, true),
  ('Tewksbury', 'MA', 'extended', ARRAY['01876'], 4, true),
  ('Billerica', 'MA', 'extended', ARRAY['01821','01862'], 5, true),
  ('Westford', 'MA', 'request', ARRAY['01886'], 6, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.site_settings (setting_key, setting_value, setting_type, category, label, sort_order)
VALUES
  ('company_name', to_jsonb('Paiva Cleaners Co.'::text), 'text', 'company', 'Company Name', 1),
  ('phone', to_jsonb('(978) 319-8939'::text), 'text', 'company', 'Phone', 2),
  ('phone_href', to_jsonb('tel:+19783198939'::text), 'text', 'company', 'Phone Link', 3),
  ('email', to_jsonb('paivacleaners@gmail.com'::text), 'text', 'company', 'Email', 4),
  ('address_line_1', to_jsonb('30 3rd Street'::text), 'text', 'company', 'Address Line 1', 5),
  ('address_line_2', to_jsonb('Lowell, MA'::text), 'text', 'company', 'Address Line 2', 6),
  ('contact_title', to_jsonb('See Pricing In 60 Seconds'::text), 'text', 'contact', 'Contact Title', 7),
  ('contact_subtitle', to_jsonb('Tell us about your space, get a fast estimate, and let us help you book the right cleaning plan.'::text), 'textarea', 'contact', 'Contact Subtitle', 8)
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value,
    setting_type = EXCLUDED.setting_type,
    category = EXCLUDED.category,
    label = EXCLUDED.label,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.services (name, slug, description, starting_price, active, display_order)
VALUES
  ('House Cleaning', 'house-cleaning', 'Routine residential cleans that keep every room fresh.', 120, true, 1),
  ('Deep Cleaning', 'deep-cleaning', 'A heavy-duty top-to-bottom reset for your home.', 220, true, 2),
  ('Move In / Move Out', 'move-in-move-out', 'Empty-home cleans built for landlords and tenants.', 260, true, 3),
  ('Recurring Cleaning', 'recurring-cleaning', 'Weekly, bi-weekly, or monthly cleaning on your schedule.', 110, true, 4),
  ('Office Cleaning', 'office-cleaning', 'Workspaces that look and feel professional.', 180, true, 5),
  ('Commercial Cleaning', 'commercial-cleaning', 'Offices, clinics, retail, and commercial spaces.', 200, true, 6)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    starting_price = EXCLUDED.starting_price,
    active = EXCLUDED.active,
    display_order = EXCLUDED.display_order;

INSERT INTO public.pricing_rules (category, name, label, value, value_type, active, is_active, sort_order)
VALUES
  ('service', 'standard', 'Standard Cleaning', 120, 'fixed_amount', true, true, 1),
  ('service', 'deep', 'Deep Cleaning', 220, 'fixed_amount', true, true, 2),
  ('service', 'move', 'Move In / Move Out', 260, 'fixed_amount', true, true, 3),
  ('frequency', 'one_time', 'One-Time', 0, 'percentage', true, true, 1),
  ('frequency', 'weekly', 'Weekly', 15, 'percentage', true, true, 2),
  ('extra', 'oven', 'Inside oven', 35, 'fixed_amount', true, true, 1),
  ('setting', 'minimum_price', 'Minimum price', 95, 'fixed_amount', true, true, 1)
ON CONFLICT (category, name) DO UPDATE
SET label = EXCLUDED.label,
    value = EXCLUDED.value,
    value_type = EXCLUDED.value_type,
    active = EXCLUDED.active,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.portfolio_items (title, description, category, room, before_image_url, after_image_url, is_public, is_featured, display_order)
VALUES
  ('Kitchen Deep Clean', 'Deep cleaning transformation in a busy family kitchen.', 'Deep Cleaning', 'Kitchen', NULL, NULL, true, true, 1),
  ('Move-Out Bathroom Reset', 'Detailed bathroom restoration for move-out inspection.', 'Move In/Out', 'Bathroom', NULL, NULL, true, false, 2),
  ('Office Floor Refresh', 'Commercial workspace refresh before Monday opening.', 'Commercial', 'Office', NULL, NULL, true, false, 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.reviews (customer_name, rating, review_text, is_public, is_featured, anonymize_name)
VALUES
  ('Marina C.', 5, 'Very professional and easy to schedule. The house looked amazing after the first visit.', true, true, false),
  ('Daniel R.', 5, 'Our office finally feels truly clean. The team is consistent and detail-oriented.', true, false, false),
  ('Priya S.', 5, 'I booked a move-out clean and got my full deposit back. Fast booking and no surprises.', true, false, false)
ON CONFLICT DO NOTHING;
