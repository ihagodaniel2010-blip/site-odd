-- 1. pricing_rules table
CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  value_type TEXT NOT NULL DEFAULT 'fixed_amount',
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category, name)
);

CREATE INDEX idx_pricing_rules_category ON public.pricing_rules(category, sort_order);

ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

-- Public read (active rules) so the public estimate form can use them
CREATE POLICY "Pricing rules are publicly readable"
ON public.pricing_rules FOR SELECT
TO anon, authenticated
USING (active = true);

-- Admins can manage everything
CREATE POLICY "Admins can manage pricing rules"
ON public.pricing_rules FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- TEMP: open access while auth is disabled
CREATE POLICY "TEMP public manage pricing rules"
ON public.pricing_rules FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE TRIGGER trg_pricing_rules_updated
BEFORE UPDATE ON public.pricing_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. contacted_via on estimate_requests
ALTER TABLE public.estimate_requests
ADD COLUMN IF NOT EXISTS contacted_via TEXT;

-- 3. Seed default pricing
INSERT INTO public.pricing_rules (category, name, label, value, value_type, sort_order) VALUES
  -- Services (base price)
  ('service', 'standard', 'Standard Cleaning', 120, 'fixed_amount', 1),
  ('service', 'deep', 'Deep Cleaning', 220, 'fixed_amount', 2),
  ('service', 'move', 'Move In / Move Out', 260, 'fixed_amount', 3),
  ('service', 'recurring', 'Recurring Cleaning', 110, 'fixed_amount', 4),
  ('service', 'office', 'Office Cleaning', 180, 'fixed_amount', 5),
  ('service', 'clinic', 'Clinic Cleaning', 220, 'fixed_amount', 6),
  ('service', 'retail', 'Retail Cleaning', 160, 'fixed_amount', 7),
  ('service', 'post_construction', 'Post Construction Cleaning', 300, 'fixed_amount', 8),
  -- Bedrooms
  ('bedroom', '0', 'Studio', 0, 'fixed_amount', 1),
  ('bedroom', '1', '1 Bedroom', 0, 'fixed_amount', 2),
  ('bedroom', '2', '2 Bedrooms', 25, 'fixed_amount', 3),
  ('bedroom', '3', '3 Bedrooms', 50, 'fixed_amount', 4),
  ('bedroom', '4', '4 Bedrooms', 80, 'fixed_amount', 5),
  ('bedroom', '5+', '5+ Bedrooms', 120, 'fixed_amount', 6),
  -- Bathrooms
  ('bathroom', '1', '1 Bathroom', 0, 'fixed_amount', 1),
  ('bathroom', '2', '2 Bathrooms', 35, 'fixed_amount', 2),
  ('bathroom', '3', '3 Bathrooms', 70, 'fixed_amount', 3),
  ('bathroom', '4+', '4+ Bathrooms', 110, 'fixed_amount', 4),
  -- Frequency (percentage discount, 0-100)
  ('frequency', 'one_time', 'One-Time', 0, 'percentage', 1),
  ('frequency', 'weekly', 'Weekly', 15, 'percentage', 2),
  ('frequency', 'biweekly', 'Bi-Weekly', 10, 'percentage', 3),
  ('frequency', 'monthly', 'Monthly', 5, 'percentage', 4),
  -- Zones
  ('zone', 'regular', 'Regular Service Area', 0, 'fixed_amount', 1),
  ('zone', 'extended', 'Extended Service Area', 25, 'fixed_amount', 2),
  ('zone', 'request', 'By Request', 0, 'manual_review', 3),
  -- Extras
  ('extra', 'oven', 'Inside oven', 35, 'fixed_amount', 1),
  ('extra', 'fridge', 'Inside fridge', 35, 'fixed_amount', 2),
  ('extra', 'windows', 'Interior windows', 50, 'fixed_amount', 3),
  ('extra', 'laundry', 'Laundry', 40, 'fixed_amount', 4),
  ('extra', 'cabinets', 'Cabinets interior', 60, 'fixed_amount', 5),
  ('extra', 'pets', 'Pet hair extra', 30, 'fixed_amount', 6),
  ('extra', 'basement', 'Basement', 50, 'fixed_amount', 7),
  ('extra', 'garage', 'Garage', 60, 'fixed_amount', 8),
  -- Settings
  ('setting', 'minimum_price', 'Minimum price', 95, 'fixed_amount', 1),
  ('setting', 'emergency_fee', 'Emergency / same-day fee', 60, 'fixed_amount', 2);