-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
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

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Estimate request status enum
CREATE TYPE public.estimate_status AS ENUM (
  'new_request', 'contacted', 'estimate_sent', 'scheduled', 'completed', 'cancelled'
);

CREATE TABLE public.estimate_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  zip_code text NOT NULL,
  city text,
  service_type text NOT NULL,
  property_type text,
  bedrooms text,
  bathrooms text,
  frequency text,
  preferred_date date,
  preferred_time text,
  notes text,
  calculated_estimate numeric(10,2),
  estimate_breakdown jsonb,
  service_zone text,
  status public.estimate_status NOT NULL DEFAULT 'new_request',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.estimate_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit estimate requests"
  ON public.estimate_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all estimates"
  ON public.estimate_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update estimates"
  ON public.estimate_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete estimates"
  ON public.estimate_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_estimate_requests_updated_at
  BEFORE UPDATE ON public.estimate_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Areas served
CREATE TABLE public.areas_served (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  state text NOT NULL,
  zone text NOT NULL CHECK (zone IN ('regular', 'extended', 'request')),
  active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.areas_served ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Areas are publicly readable"
  ON public.areas_served FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admins can manage areas"
  ON public.areas_served FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed areas
INSERT INTO public.areas_served (city, state, zone, display_order) VALUES
('Lowell', 'MA', 'regular', 1),
('Dracut', 'MA', 'regular', 2),
('Chelmsford', 'MA', 'regular', 3),
('Tewksbury', 'MA', 'regular', 4),
('Billerica', 'MA', 'regular', 5),
('Westford', 'MA', 'regular', 6),
('Tyngsborough', 'MA', 'regular', 7),
('Dunstable', 'MA', 'regular', 8),
('Andover', 'MA', 'regular', 9),
('North Andover', 'MA', 'regular', 10),
('Lawrence', 'MA', 'regular', 11),
('Methuen', 'MA', 'regular', 12),
('Wilmington', 'MA', 'extended', 20),
('Burlington', 'MA', 'extended', 21),
('Bedford', 'MA', 'extended', 22),
('Woburn', 'MA', 'extended', 23),
('Concord', 'MA', 'extended', 24),
('Acton', 'MA', 'extended', 25),
('Lexington', 'MA', 'extended', 26),
('Waltham', 'MA', 'extended', 27),
('Nashua', 'NH', 'extended', 28),
('Hudson', 'NH', 'extended', 29),
('Pelham', 'NH', 'extended', 30),
('Salem', 'NH', 'extended', 31),
('Windham', 'NH', 'extended', 32),
('Boston', 'MA', 'request', 40),
('Cambridge', 'MA', 'request', 41),
('Somerville', 'MA', 'request', 42),
('Worcester', 'MA', 'request', 43),
('Manchester', 'NH', 'request', 44);