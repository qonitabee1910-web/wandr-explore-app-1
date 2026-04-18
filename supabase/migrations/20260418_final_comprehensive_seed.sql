-- 1. Cleanup: Hapus data mockup dengan CASCADE untuk menjaga integritas referensial
-- Menggunakan TRUNCATE CASCADE memastikan semua relasi yang bergantung juga ikut dibersihkan secara aman.

BEGIN;

-- Hapus data booking terlebih dahulu karena bergantung pada schedule dan pickup points
TRUNCATE TABLE shuttle_booking_seats CASCADE;
TRUNCATE TABLE shuttle_bookings CASCADE;

-- Hapus data schedule yang bergantung pada routes dan vehicles
TRUNCATE TABLE shuttle_schedules CASCADE;

-- Hapus data routes
TRUNCATE TABLE shuttle_routes CASCADE;

-- Hapus data pickup points yang bergantung pada rayon
TRUNCATE TABLE pickup_points CASCADE;

-- Hapus data rayon
TRUNCATE TABLE rayon_zones CASCADE;

-- Hapus data vehicles (opsional, tapi biasanya seed data menyertakan vehicle baru)
TRUNCATE TABLE vehicles CASCADE;

COMMIT;

-- 2. Dokumentasi Struktur Tabel Terlibat
/*
    - rayon_zones: Tabel utama untuk pembagian zona (Rayon A, B, C, D, dsb).
    - pickup_points: Titik-titik penjemputan dalam setiap Rayon, memiliki FK ke rayon_zones.
    - shuttle_routes: Definisi rute utama (misal: Medan - KNO).
    - shuttle_schedules: Jadwal keberangkatan untuk rute tertentu, memiliki FK ke shuttle_routes dan vehicles.
    - vehicles: Armada yang digunakan dalam schedule.
    - shuttle_bookings: Data pemesanan user, memiliki FK ke schedule, rayon, dan pickup_point.
*/

-- 3. Seed Data Komprehensif (50+ Rayon/Points, 100+ Routes/Schedules)

-- SEEDING VEHICLES
INSERT INTO vehicles (name, slug, layout, is_active)
VALUES 
('Toyota Hiace Premio Luxury', 'hiace-luxury-1', '[{"id":"S1","label":"1","x":25,"y":20,"status":"available"},{"id":"S2","label":"2","x":75,"y":20,"status":"available"}]'::jsonb, true),
('Toyota Hiace Commuter Std', 'hiace-std-1', '[{"id":"S1","label":"1","x":25,"y":20,"status":"available"}]'::jsonb, true),
('Isuzu Elf Long', 'elf-long-1', '[]'::jsonb, true);

-- SEEDING RAYON ZONES (Berbagai Level & Skenario)
DO $$
DECLARE
    r_id UUID;
BEGIN
    -- Rayon A: Medan Kota (Pusat Bisnis)
    INSERT INTO rayon_zones (name, description, base_fare_regular, base_fare_executive, base_fare_vip, price_per_km_regular, price_per_km_executive, price_per_km_vip)
    VALUES ('RAYON-A', 'Medan Kota - Area Pusat Bisnis & Hotel', 80000, 120000, 200000, 1500, 2000, 3000) RETURNING id INTO r_id;
    
    -- Points for Rayon A (15 points)
    FOR i IN 1..15 LOOP
        INSERT INTO pickup_points (rayon_id, place_name, time_wib, latitude, longitude, jarak_ke_kno, is_active)
        VALUES (r_id, 'Point A-' || i, '06:00'::time + (i * interval '5 minutes'), 3.58 + (i * 0.001), 98.67 + (i * 0.001), 23 + i, (i % 5 != 0));
    END LOOP;

    -- Rayon B: Medan Barat
    INSERT INTO rayon_zones (name, description, base_fare_regular, base_fare_executive, base_fare_vip)
    VALUES ('RAYON-B', 'Medan Barat - Pemukiman', 85000, 125000, 210000) RETURNING id INTO r_id;
    
    FOR i IN 1..15 LOOP
        INSERT INTO pickup_points (rayon_id, place_name, time_wib, latitude, longitude, jarak_ke_kno)
        VALUES (r_id, 'Point B-' || i, '06:00'::time + (i * interval '5 minutes'), 3.59 + (i * 0.001), 98.65 + (i * 0.001), 25 + i);
    END LOOP;

    -- Rayon C: Medan Utara
    INSERT INTO rayon_zones (name, description, base_fare_regular, base_fare_executive, base_fare_vip)
    VALUES ('RAYON-C', 'Medan Utara - Kawasan Industri', 90000, 130000, 220000) RETURNING id INTO r_id;
    
    FOR i IN 1..15 LOOP
        INSERT INTO pickup_points (rayon_id, place_name, time_wib, latitude, longitude, jarak_ke_kno)
        VALUES (r_id, 'Point C-' || i, '07:00'::time + (i * interval '5 minutes'), 3.61 + (i * 0.001), 98.68 + (i * 0.001), 22 + i);
    END LOOP;

    -- Rayon D: Medan Selatan
    INSERT INTO rayon_zones (name, description, base_fare_regular, base_fare_executive, base_fare_vip)
    VALUES ('RAYON-D', 'Medan Selatan - Pendidikan', 75000, 115000, 190000) RETURNING id INTO r_id;
    
    FOR i IN 1..15 LOOP
        INSERT INTO pickup_points (rayon_id, place_name, time_wib, latitude, longitude, jarak_ke_kno)
        VALUES (r_id, 'Point D-' || i, '05:30'::time + (i * interval '10 minutes'), 3.54 + (i * 0.001), 98.64 + (i * 0.001), 28 + i);
    END LOOP;
END $$;

-- SEEDING ROUTES & SCHEDULES (100+ Records)
DO $$
DECLARE
    route_id UUID;
    v_id UUID;
    v_luxury_id UUID;
    v_elf_id UUID;
BEGIN
    SELECT id INTO v_id FROM vehicles WHERE slug = 'hiace-std-1' LIMIT 1;
    SELECT id INTO v_luxury_id FROM vehicles WHERE slug = 'hiace-luxury-1' LIMIT 1;
    SELECT id INTO v_elf_id FROM vehicles WHERE slug = 'elf-long-1' LIMIT 1;

    -- 1. Route: Medan - KNO (Main Route)
    INSERT INTO shuttle_routes (name, slug, origin, destination, is_active)
    VALUES ('Medan ke Bandara Kualanamu', 'medan-kno-main', 'Medan', 'Kualanamu', true) RETURNING id INTO route_id;

    -- 40 Schedules for this route (Morning to Night, every 30 mins)
    FOR i IN 0..39 LOOP
        INSERT INTO shuttle_schedules (route_id, departure_time, arrival_time, vehicle_id, price_regular, price_executive, price_vip, available_seats, is_active)
        VALUES (
            route_id, 
            NOW() + (i * interval '30 minutes'), 
            NOW() + (i * interval '30 minutes') + interval '90 minutes',
            CASE WHEN i % 5 = 0 THEN v_luxury_id ELSE v_id END,
            120000, 180000, 250000, 10,
            (i % 10 != 0) -- Some inactive for testing
        );
    END LOOP;

    -- 2. Route: KNO - Medan (Return Route)
    INSERT INTO shuttle_routes (name, slug, origin, destination, is_active)
    VALUES ('Bandara Kualanamu ke Medan', 'kno-medan-main', 'Kualanamu', 'Medan', true) RETURNING id INTO route_id;

    -- 30 Schedules
    FOR i IN 0..29 LOOP
        INSERT INTO shuttle_schedules (route_id, departure_time, arrival_time, vehicle_id, price_regular, price_executive, price_vip, available_seats)
        VALUES (
            route_id, 
            NOW() + (i * interval '45 minutes'), 
            NOW() + (i * interval '45 minutes') + interval '90 minutes',
            v_id, 120000, 180000, 250000, 10
        );
    END LOOP;

    -- 3. Route: Medan - Siantar (Long Distance Edge Case)
    INSERT INTO shuttle_routes (name, slug, origin, destination, is_active)
    VALUES ('Medan ke Pematang Siantar', 'medan-siantar', 'Medan', 'Siantar', true) RETURNING id INTO route_id;

    -- 20 Schedules
    FOR i IN 0..19 LOOP
        INSERT INTO shuttle_schedules (route_id, departure_time, arrival_time, vehicle_id, price_regular, price_executive, price_vip, available_seats)
        VALUES (
            route_id, 
            NOW() + (i * interval '2 hours'), 
            NOW() + (i * interval '2 hours') + interval '3 hours',
            v_elf_id, 150000, 220000, 300000, 15
        );
    END LOOP;

    -- 4. Inactive Route (Edge Case)
    INSERT INTO shuttle_routes (name, slug, origin, destination, is_active)
    VALUES ('Medan ke Binjai (Suspended)', 'medan-binjai-inactive', 'Medan', 'Binjai', false) RETURNING id INTO route_id;
    
    -- 10 Schedules for inactive route
    FOR i IN 0..9 LOOP
        INSERT INTO shuttle_schedules (route_id, departure_time, arrival_time, vehicle_id, price_regular, price_executive, price_vip, available_seats, is_active)
        VALUES (route_id, NOW() + (i * interval '1 hour'), NOW() + (i * interval '1 hour') + interval '45 minutes', v_id, 50000, 80000, 120000, 10, false);
    END LOOP;
END $$;
