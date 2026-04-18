-- Admin SELECT policies
CREATE POLICY "Admins can view all bookings"
ON public.bookings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Vehicles table for multi-vehicle layout support
CREATE TABLE public.vehicles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  layout jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active vehicles"
ON public.vehicles FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage vehicles"
ON public.vehicles FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default Hiace vehicle
INSERT INTO public.vehicles (name, slug, description, layout) VALUES (
  'Toyota Hiace', 'hiace', '14-seat shuttle van',
  '[
    {"id":"1A","label":"1A","x":32,"y":14,"status":"occupied"},
    {"id":"1B","label":"1B","x":68,"y":14,"status":"available"},
    {"id":"2A","label":"2A","x":22,"y":32,"status":"available"},
    {"id":"2B","label":"2B","x":50,"y":32,"status":"occupied"},
    {"id":"2C","label":"2C","x":78,"y":32,"status":"available"},
    {"id":"3A","label":"3A","x":22,"y":48,"status":"available"},
    {"id":"3B","label":"3B","x":50,"y":48,"status":"available"},
    {"id":"3C","label":"3C","x":78,"y":48,"status":"occupied"},
    {"id":"4A","label":"4A","x":22,"y":64,"status":"available"},
    {"id":"4B","label":"4B","x":50,"y":64,"status":"available"},
    {"id":"4C","label":"4C","x":78,"y":64,"status":"available"},
    {"id":"5A","label":"5A","x":22,"y":82,"status":"available"},
    {"id":"5B","label":"5B","x":50,"y":82,"status":"occupied"},
    {"id":"5C","label":"5C","x":78,"y":82,"status":"available"}
  ]'::jsonb
);