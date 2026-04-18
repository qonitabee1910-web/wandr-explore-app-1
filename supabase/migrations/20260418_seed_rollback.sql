-- Rollback Script for 20260418_final_comprehensive_seed.sql
-- Digunakan untuk membersihkan data seed yang baru dimasukkan tanpa menghapus struktur tabel.

BEGIN;

-- 1. Hapus Schedules (Berdasarkan routes yang kita buat)
DELETE FROM shuttle_schedules 
WHERE route_id IN (
    SELECT id FROM shuttle_routes 
    WHERE slug IN ('medan-kno-main', 'kno-medan-main', 'medan-siantar', 'medan-binjai-inactive')
);

-- 2. Hapus Routes
DELETE FROM shuttle_routes 
WHERE slug IN ('medan-kno-main', 'kno-medan-main', 'medan-siantar', 'medan-binjai-inactive');

-- 3. Hapus Pickup Points (Berdasarkan rayon yang kita buat)
DELETE FROM pickup_points 
WHERE rayon_id IN (
    SELECT id FROM rayon_zones 
    WHERE name IN ('RAYON-A', 'RAYON-B', 'RAYON-C', 'RAYON-D')
);

-- 4. Hapus Rayon Zones
DELETE FROM rayon_zones 
WHERE name IN ('RAYON-A', 'RAYON-B', 'RAYON-C', 'RAYON-D');

-- 5. Hapus Vehicles (Berdasarkan slug)
DELETE FROM vehicles 
WHERE slug IN ('hiace-luxury-1', 'hiace-std-1', 'elf-long-1');

COMMIT;
