-- Migration to add Rayon and Pickup Points for KNO Airport Shuttle

-- 1. Create Rayon Table
CREATE TABLE IF NOT EXISTS rayon_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- RAYON-A, RAYON-B, etc.
    description TEXT,
    base_fare_regular NUMERIC DEFAULT 0,
    base_fare_executive NUMERIC DEFAULT 0,
    base_fare_vip NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Pickup Points Table
CREATE TABLE IF NOT EXISTS pickup_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rayon_id UUID REFERENCES rayon_zones(id) ON DELETE CASCADE,
    place_name TEXT NOT NULL,
    time_wib TIME NOT NULL,
    distance_from_previous_mtr NUMERIC NOT NULL DEFAULT 0, -- Distance from last point in meters
    cumulative_distance_mtr NUMERIC NOT NULL DEFAULT 0, -- Total distance from start of rayon
    latitude NUMERIC,
    longitude NUMERIC,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add rayon_id to shuttle_bookings for reporting
ALTER TABLE shuttle_bookings ADD COLUMN IF NOT EXISTS rayon_id UUID REFERENCES rayon_zones(id);
ALTER TABLE shuttle_bookings ADD COLUMN IF NOT EXISTS pickup_point_id UUID REFERENCES pickup_points(id);

-- 4. Enable RLS
ALTER TABLE rayon_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_points ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Public read rayon_zones" ON rayon_zones FOR SELECT USING (true);
CREATE POLICY "Public read pickup_points" ON pickup_points FOR SELECT USING (true);
CREATE POLICY "Admin manage rayon_zones" ON rayon_zones FOR ALL USING (true); -- Replace with proper admin check in production
CREATE POLICY "Admin manage pickup_points" ON pickup_points FOR ALL USING (true);
