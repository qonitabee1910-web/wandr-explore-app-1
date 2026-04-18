-- Data Migration & Schema Refactor for Rayon System
-- 1. Cleanup: Remove existing mockup data
TRUNCATE TABLE pickup_points CASCADE;
TRUNCATE TABLE rayon_zones CASCADE;

-- 2. Schema Refactor: Add precise coordinate fields and distance to KNO
ALTER TABLE pickup_points 
ADD COLUMN IF NOT EXISTS jarak_ke_kno NUMERIC, -- Distance in KM
ADD COLUMN IF NOT EXISTS lat_lng POINT; -- Alternative geometric type for index/queries

-- Ensure no null values for coordinates in future inserts
ALTER TABLE pickup_points ALTER COLUMN latitude SET NOT NULL;
ALTER TABLE pickup_points ALTER COLUMN longitude SET NOT NULL;
ALTER TABLE pickup_points ALTER COLUMN jarak_ke_kno SET NOT NULL;

-- 3. Update Rayon Zones schema with central coordinates if needed
ALTER TABLE rayon_zones
ADD COLUMN IF NOT EXISTS center_lat NUMERIC,
ADD COLUMN IF NOT EXISTS center_lng NUMERIC;
