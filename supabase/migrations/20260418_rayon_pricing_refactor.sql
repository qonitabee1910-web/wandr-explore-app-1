-- Refactor Rayon System: Pricing Rules and Distance-based Calculation
-- 1. Modify rayon_zones to include price_per_km
ALTER TABLE rayon_zones ADD COLUMN IF NOT EXISTS price_per_km_regular NUMERIC DEFAULT 1500;
ALTER TABLE rayon_zones ADD COLUMN IF NOT EXISTS price_per_km_executive NUMERIC DEFAULT 2000;
ALTER TABLE rayon_zones ADD COLUMN IF NOT EXISTS price_per_km_vip NUMERIC DEFAULT 3000;

-- 2. Ensure pickup_points doesn't have manual fare (it already doesn't in our schema)
-- We use cumulative_distance_mtr to calculate the fare dynamically.

-- 3. Create a view for easy fare calculation if needed (optional but helpful)
CREATE OR REPLACE VIEW rayon_fare_preview AS
SELECT 
    r.name as rayon_name,
    p.place_name,
    p.cumulative_distance_mtr,
    -- Formula: Base Fare + (Distance in KM * Price/KM)
    (r.base_fare_regular + (p.cumulative_distance_mtr / 1000.0 * r.price_per_km_regular)) as calculated_fare_regular,
    (r.base_fare_executive + (p.cumulative_distance_mtr / 1000.0 * r.price_per_km_executive)) as calculated_fare_executive,
    (r.base_fare_vip + (p.cumulative_distance_mtr / 1000.0 * r.price_per_km_vip)) as calculated_fare_vip
FROM rayon_zones r
JOIN pickup_points p ON r.id = p.rayon_id;
