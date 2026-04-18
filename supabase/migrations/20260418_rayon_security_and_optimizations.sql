-- Rayon and Pickup Point Security & Performance Optimizations

-- 1. DROP old permissive policies
DROP POLICY IF EXISTS "Public read rayon_zones" ON rayon_zones;
DROP POLICY IF EXISTS "Public read pickup_points" ON pickup_points;
DROP POLICY IF EXISTS "Admin manage rayon_zones" ON rayon_zones;
DROP POLICY IF EXISTS "Admin manage pickup_points" ON pickup_points;

-- 2. CREATE NEW Secure RLS Policies
-- Use public.has_role function for admin check

-- RAYON_ZONES
CREATE POLICY "Public read rayon_zones" ON rayon_zones 
  FOR SELECT USING (true);

CREATE POLICY "Admin manage rayon_zones" ON rayon_zones 
  FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PICKUP_POINTS
CREATE POLICY "Public read pickup_points" ON pickup_points 
  FOR SELECT USING (true);

CREATE POLICY "Admin manage pickup_points" ON pickup_points 
  FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Optimization: Revenue Summary View
-- This prevents the need to fetch all bookings in AdminRayonManagement.tsx
CREATE OR REPLACE VIEW rayon_revenue_summary AS
SELECT 
    r.id as rayon_id,
    r.name as rayon_name,
    COUNT(b.id) as booking_count,
    COALESCE(SUM(b.total_price), 0) as total_revenue
FROM rayon_zones r
LEFT JOIN shuttle_bookings b ON r.id = b.rayon_id
GROUP BY r.id, r.name;

-- Grant access to the view
ALTER VIEW rayon_revenue_summary OWNER TO postgres;
GRANT SELECT ON rayon_revenue_summary TO authenticated, anon;

-- 4. Constraint: Ensure distances are positive
ALTER TABLE pickup_points 
  ADD CONSTRAINT check_positive_distance 
  CHECK (jarak_ke_kno >= 0 AND cumulative_distance_mtr >= 0);
