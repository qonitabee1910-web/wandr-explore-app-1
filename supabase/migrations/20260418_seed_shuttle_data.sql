-- SQL Script to Seed Shuttle Data and Enable RLS Policies
-- Execute this in your Supabase SQL Editor

-- 1. Enable RLS for all shuttle tables
ALTER TABLE shuttle_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shuttle_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE shuttle_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE shuttle_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shuttle_booking_seats ENABLE ROW LEVEL SECURITY;

-- 2. Create Public Read Policies
CREATE POLICY "Allow public read for routes" ON shuttle_routes FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read for schedules" ON shuttle_schedules FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read for services" ON shuttle_services FOR SELECT USING (is_active = true);

-- 3. Seed a Hiace Vehicle (if not exists)
-- Note: Make sure 'vehicles' table exists first. 
-- Adjust the layout JSON to match your Seat structure if needed.
INSERT INTO vehicles (name, slug, layout, is_active)
VALUES (
  'Toyota Hiace Premium', 
  'hiace-premium-1', 
  '[
    {"id":"S1","label":"1","x":25,"y":20,"status":"available"},
    {"id":"S2","label":"2","x":75,"y":20,"status":"available"},
    {"id":"S3","label":"3","x":25,"y":40,"status":"available"},
    {"id":"S4","label":"4","x":75,"y":40,"status":"available"},
    {"id":"S5","label":"5","x":25,"y":60,"status":"available"},
    {"id":"S6","label":"6","x":75,"y":60,"status":"available"},
    {"id":"S7","label":"7","x":50,"y":85,"status":"available"}
  ]'::jsonb,
  true
) ON CONFLICT (slug) DO NOTHING;

-- 4. Seed Routes
INSERT INTO shuttle_routes (name, slug, origin, destination, is_active)
VALUES 
  ('Medan - Kualanamu (KNO)', 'medan-kno', 'Medan', 'Kualanamu (KNO)', true),
  ('Kualanamu (KNO) - Medan', 'kno-medan', 'Kualanamu (KNO)', 'Medan', true),
  ('Pematang Siantar - Medan', 'siantar-medan', 'Pematang Siantar', 'Medan', true)
ON CONFLICT (slug) DO NOTHING;

-- 5. Seed Schedules (Linked to the seeded vehicle and routes)
-- We use subqueries to get the IDs
DO $$
DECLARE
    v_id UUID;
    r1_id UUID;
    r2_id UUID;
BEGIN
    SELECT id INTO v_id FROM vehicles WHERE slug = 'hiace-premium-1' LIMIT 1;
    SELECT id INTO r1_id FROM shuttle_routes WHERE slug = 'medan-kno' LIMIT 1;
    SELECT id INTO r2_id FROM shuttle_routes WHERE slug = 'kno-medan' LIMIT 1;

    IF v_id IS NOT NULL AND r1_id IS NOT NULL THEN
        -- Morning Schedule
        INSERT INTO shuttle_schedules (route_id, departure_time, arrival_time, vehicle_id, price_regular, price_executive, price_vip, available_seats)
        VALUES (r1_id, '2026-04-18 08:00:00', '2026-04-18 09:30:00', v_id, 120000, 180000, 250000, 10);
        
        -- Afternoon Schedule
        INSERT INTO shuttle_schedules (route_id, departure_time, arrival_time, vehicle_id, price_regular, price_executive, price_vip, available_seats)
        VALUES (r1_id, '2026-04-18 14:00:00', '2026-04-18 15:30:00', v_id, 120000, 180000, 250000, 10);
    END IF;

    IF v_id IS NOT NULL AND r2_id IS NOT NULL THEN
        INSERT INTO shuttle_schedules (route_id, departure_time, arrival_time, vehicle_id, price_regular, price_executive, price_vip, available_seats)
        VALUES (r2_id, '2026-04-18 11:00:00', '2026-04-18 12:30:00', v_id, 120000, 180000, 250000, 10);
    END IF;
END $$;
