-- Align portfolio_items with before/after public portfolio requirements

ALTER TABLE public.portfolio_items
  ADD COLUMN IF NOT EXISTS room text,
  ADD COLUMN IF NOT EXISTS before_image_url text,
  ADD COLUMN IF NOT EXISTS after_image_url text,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Backfill new columns from legacy shape when data exists
UPDATE public.portfolio_items
SET
  room = COALESCE(room, location, 'Other'),
  before_image_url = COALESCE(before_image_url, image_url),
  after_image_url = COALESCE(after_image_url, image_url),
  is_public = COALESCE(is_public, active, true),
  is_featured = COALESCE(is_featured, featured, false)
WHERE true;

CREATE INDEX IF NOT EXISTS portfolio_items_public_order_idx
  ON public.portfolio_items (is_public, is_featured, display_order, created_at DESC);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Portfolio is publicly readable" ON public.portfolio_items;
CREATE POLICY "Portfolio is publicly readable"
  ON public.portfolio_items FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

DROP POLICY IF EXISTS "Admins manage portfolio items" ON public.portfolio_items;
CREATE POLICY "Admins manage portfolio items"
  ON public.portfolio_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
