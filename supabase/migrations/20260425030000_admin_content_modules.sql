-- Portfolio items
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location TEXT,
  image_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portfolio_items_active_order_idx
  ON public.portfolio_items (active, display_order, created_at DESC);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portfolio is publicly readable"
  ON public.portfolio_items FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "TEMP public manage portfolio"
  ON public.portfolio_items FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP TRIGGER IF EXISTS update_portfolio_items_updated_at ON public.portfolio_items;
CREATE TRIGGER update_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  starting_price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS services_active_order_idx
  ON public.services (active, display_order, created_at DESC);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are publicly readable"
  ON public.services FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "TEMP public manage services"
  ON public.services FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.services (name, slug, description, starting_price, active, display_order)
VALUES
  ('Standard House Cleaning', 'house-cleaning', 'Routine top-to-bottom cleaning for the home you love.', 120, true, 1),
  ('Deep Cleaning', 'deep-cleaning', 'An intensive reset for kitchens, bathrooms and overlooked corners.', 220, true, 2),
  ('Move In / Move Out', 'move-in-move-out', 'Empty-home detail cleaning that hands the keys over spotless.', 260, true, 3),
  ('Recurring Cleaning', 'recurring-cleaning', 'Weekly, bi-weekly or monthly visits with a dedicated team.', 110, true, 4),
  ('Office Cleaning', 'office-cleaning', 'Quiet, after-hours cleaning that keeps your team productive.', 180, true, 5),
  ('Commercial Cleaning', 'commercial-cleaning', 'Clinics, retail and post-construction cleaning with higher standards.', 180, true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Media assets
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'other',
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_assets_section_idx
  ON public.media_assets (section, created_at DESC);

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media assets are publicly readable"
  ON public.media_assets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "TEMP public manage media assets"
  ON public.media_assets FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Messages log
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_request_id UUID REFERENCES public.estimate_requests(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_sent_at_idx
  ON public.messages (sent_at DESC, created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TEMP public manage messages"
  ON public.messages FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Storage bucket for media manager
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read media objects"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media');

CREATE POLICY "TEMP public manage media objects"
  ON storage.objects FOR ALL
  TO anon, authenticated
  USING (bucket_id = 'media')
  WITH CHECK (bucket_id = 'media');

-- Update contact details globally in settings
UPDATE public.site_settings
SET setting_value = '(978) 319-8939'
WHERE setting_key = 'phone';

UPDATE public.site_settings
SET setting_value = 'tel:+19783198939'
WHERE setting_key = 'phone_href';

UPDATE public.site_settings
SET setting_value = 'paivacleaners@gmail.com'
WHERE setting_key = 'email';
