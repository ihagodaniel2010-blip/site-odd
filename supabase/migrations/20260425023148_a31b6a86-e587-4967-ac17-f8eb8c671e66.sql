-- ============ CUSTOMERS ============
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  notes TEXT,
  last_service_date DATE,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS customers_email_unique
  ON public.customers (lower(email)) WHERE email IS NOT NULL AND email <> '';

CREATE INDEX IF NOT EXISTS customers_phone_idx ON public.customers (phone);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage customers"
  ON public.customers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- TEMP open access (auth disabled mode)
CREATE POLICY "TEMP public manage customers"
  ON public.customers FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create/update customer when estimate becomes scheduled/completed
CREATE OR REPLACE FUNCTION public.sync_customer_from_estimate()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_amount NUMERIC := COALESCE(NEW.calculated_estimate, 0);
BEGIN
  IF NEW.status NOT IN ('scheduled','completed') THEN
    RETURN NEW;
  END IF;

  -- Try to find by email, then phone
  SELECT id INTO v_id FROM public.customers
   WHERE (NEW.email IS NOT NULL AND lower(email) = lower(NEW.email))
      OR (NEW.phone IS NOT NULL AND phone = NEW.phone)
   LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO public.customers (name, phone, email, address, city, zip_code, status, last_service_date, total_spent)
    VALUES (
      NEW.full_name, NEW.phone, NEW.email, NEW.address, NEW.city, NEW.zip_code,
      'active',
      CASE WHEN NEW.status='completed' THEN COALESCE(NEW.preferred_date, CURRENT_DATE) ELSE NEW.preferred_date END,
      CASE WHEN NEW.status='completed' THEN v_amount ELSE 0 END
    );
  ELSE
    UPDATE public.customers SET
      name = COALESCE(NULLIF(NEW.full_name,''), name),
      phone = COALESCE(NULLIF(NEW.phone,''), phone),
      email = COALESCE(NULLIF(NEW.email,''), email),
      address = COALESCE(NULLIF(NEW.address,''), address),
      city = COALESCE(NULLIF(NEW.city,''), city),
      zip_code = COALESCE(NULLIF(NEW.zip_code,''), zip_code),
      last_service_date = CASE
        WHEN NEW.status='completed' THEN COALESCE(NEW.preferred_date, CURRENT_DATE)
        ELSE COALESCE(NEW.preferred_date, last_service_date)
      END,
      total_spent = total_spent + CASE WHEN NEW.status='completed' THEN v_amount ELSE 0 END
    WHERE id = v_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS estimates_sync_customer ON public.estimate_requests;
CREATE TRIGGER estimates_sync_customer
  AFTER INSERT OR UPDATE OF status ON public.estimate_requests
  FOR EACH ROW EXECUTE FUNCTION public.sync_customer_from_estimate();

-- ============ SITE SETTINGS ============
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT NOT NULL DEFAULT 'text',
  category TEXT NOT NULL DEFAULT 'general',
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings publicly readable"
  ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage site settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "TEMP public manage site settings"
  ON public.site_settings FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed defaults
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, category, label, sort_order) VALUES
  ('company_name', 'Paiva Cleaners Co.', 'text', 'company', 'Company Name', 1),
  ('phone', '(978) 319-8939', 'text', 'company', 'Phone', 2),
  ('phone_href', 'tel:+19783198939', 'text', 'company', 'Phone link (tel:)', 3),
  ('email', 'paivacleaners@gmail.com', 'text', 'company', 'Email', 4),
  ('address_line_1', '30 3rd Street', 'text', 'company', 'Address line 1', 5),
  ('address_line_2', 'Lowell, MA', 'text', 'company', 'Address line 2', 6),
  ('business_hours', 'Mon–Sat 8am – 6pm', 'text', 'company', 'Business hours', 7),
  ('footer_description', 'Reliable, detail-focused house and commercial cleaning for Lowell, MA and surrounding communities.', 'textarea', 'footer', 'Footer description', 8),
  ('footer_copyright', '© Paiva Cleaners Co. All rights reserved.', 'text', 'footer', 'Footer copyright', 9),
  ('header_cta_text', 'Get Estimate', 'text', 'header', 'Header CTA label', 10),
  ('header_cta_link', '/contact', 'text', 'header', 'Header CTA link', 11),
  ('contact_title', 'Get Your Free Cleaning Estimate', 'text', 'contact', 'Contact page title', 12),
  ('contact_subtitle', 'Tell us about your space and see your estimated price instantly.', 'textarea', 'contact', 'Contact page subtitle', 13),
  ('social_instagram', '', 'url', 'social', 'Instagram URL', 20),
  ('social_facebook', '', 'url', 'social', 'Facebook URL', 21),
  ('social_tiktok', '', 'url', 'social', 'TikTok URL', 22),
  ('social_linkedin', '', 'url', 'social', 'LinkedIn URL', 23),
  ('social_youtube', '', 'url', 'social', 'YouTube URL', 24),
  ('social_twitter', '', 'url', 'social', 'X / Twitter URL', 25),
  ('social_whatsapp', '', 'url', 'social', 'WhatsApp URL', 26)
ON CONFLICT (setting_key) DO NOTHING;

-- ============ AREAS SEEDS ============
INSERT INTO public.areas_served (city, state, zone, active, display_order) VALUES
  ('Lowell','MA','regular',true,1),
  ('Dracut','MA','regular',true,2),
  ('Chelmsford','MA','regular',true,3),
  ('Tewksbury','MA','regular',true,4),
  ('Billerica','MA','regular',true,5),
  ('Westford','MA','regular',true,6),
  ('Tyngsborough','MA','regular',true,7),
  ('Andover','MA','regular',true,8),
  ('North Andover','MA','regular',true,9),
  ('Lawrence','MA','regular',true,10),
  ('Methuen','MA','regular',true,11),
  ('Wilmington','MA','extended',true,20),
  ('Burlington','MA','extended',true,21),
  ('Bedford','MA','extended',true,22),
  ('Woburn','MA','extended',true,23),
  ('Concord','MA','extended',true,24),
  ('Acton','MA','extended',true,25),
  ('Lexington','MA','extended',true,26),
  ('Waltham','MA','extended',true,27),
  ('Nashua','NH','extended',true,28),
  ('Hudson','NH','extended',true,29),
  ('Pelham','NH','extended',true,30),
  ('Salem','NH','extended',true,31),
  ('Windham','NH','extended',true,32),
  ('Boston','MA','request',true,40),
  ('Cambridge','MA','request',true,41),
  ('Somerville','MA','request',true,42),
  ('Worcester','MA','request',true,43),
  ('Manchester','NH','request',true,44)
ON CONFLICT DO NOTHING;