-- Final Comprehensive Rayon and Pickup Points Seed Data
-- Based on images and accurate Medan coordinates

-- Clear existing data to avoid duplicates (optional, use with caution)
-- DELETE FROM pickup_points;
-- DELETE FROM rayon_zones;

-- 1. Insert Rayon Zones
INSERT INTO rayon_zones (id, name, description, base_fare_regular, base_fare_executive, base_fare_vip, price_per_km_regular, price_per_km_executive, price_per_km_vip, center_lat, center_lng)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'RAYON-A', 'East & South Medan - Direct access to KNO via Amplas', 80000, 120000, 180000, 1500, 2500, 4000, 3.570000, 98.700000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'RAYON-B', 'West & South Medan - Coverage for Medan Baru and Johor', 85000, 125000, 190000, 1500, 2500, 4000, 3.580000, 98.650000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'RAYON-C', 'North & Central Medan - City center and business districts', 75000, 115000, 175000, 1500, 2500, 4000, 3.600000, 98.680000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'RAYON-D', 'West & North Medan - Coverage for Sunggal and USU area', 90000, 130000, 200000, 1500, 2500, 4000, 3.590000, 98.640000)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    base_fare_regular = EXCLUDED.base_fare_regular,
    base_fare_executive = EXCLUDED.base_fare_executive,
    base_fare_vip = EXCLUDED.base_fare_vip,
    price_per_km_regular = EXCLUDED.price_per_km_regular,
    price_per_km_executive = EXCLUDED.price_per_km_executive,
    price_per_km_vip = EXCLUDED.price_per_km_vip,
    center_lat = EXCLUDED.center_lat,
    center_lng = EXCLUDED.center_lng;

-- 2. Insert Pickup Points for Rayon A
INSERT INTO pickup_points (rayon_id, place_name, time_wib, distance_from_previous_mtr, cumulative_distance_mtr, jarak_ke_kno, latitude, longitude)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Hermes Palace', '06:00:00', 0, 0, 58.2, 3.582154, 98.681840),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Kama Hotel', '06:05:00', 700, 700, 57.5, 3.585500, 98.683000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Travel suite', '06:10:00', 950, 1650, 56.55, 3.587000, 98.685000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'RS Columbia Asia', '06:12:00', 150, 1800, 56.4, 3.588500, 98.686000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Selecta', '06:14:00', 110, 1910, 56.29, 3.589500, 98.687000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Danau Toba', '06:19:00', 400, 2310, 55.89, 3.581500, 98.688000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'LePolonia', '06:23:00', 950, 3260, 54.94, 3.575000, 98.682000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Istana Maimun', '06:31:00', 2000, 5260, 52.94, 3.575000, 98.684000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mesjid Raya', '06:34:00', 450, 5710, 52.49, 3.575111, 98.687321),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grand Antares', '06:46:00', 4100, 9810, 48.39, 3.558000, 98.692000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Antares', '06:53:00', 2100, 11910, 46.29, 3.548000, 98.695000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Simp Marendal Amp', '07:16:00', 7100, 19010, 39.19, 3.535000, 98.705000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'RM Khas Mandailing', '07:26:00', 3400, 22410, 35.79, 3.528000, 98.710000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'SimpAmplis', '07:39:00', 4800, 27210, 30.99, 3.540000, 98.715000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'KNO', '08:14:00', 31000, 58210, 0, 3.636000, 98.883000);

-- 3. Insert Pickup Points for Rayon B
INSERT INTO pickup_points (rayon_id, place_name, time_wib, distance_from_previous_mtr, cumulative_distance_mtr, jarak_ke_kno, latitude, longitude)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Cambridge', '06:00:00', 0, 0, 65.5, 3.584769, 98.667519),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Swiss Bellin Gajah', '06:05:00', 1400, 1400, 64.1, 3.588600, 98.661400),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Grand Darussalam', '06:08:00', 750, 2150, 63.35, 3.590000, 98.658000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Sulthan Hotel', '06:10:00', 160, 2310, 63.19, 3.591000, 98.657000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Grand Kanaya', '06:12:00', 160, 2470, 63.03, 3.592000, 98.656000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Four Point', '06:15:00', 450, 2920, 62.58, 3.594000, 98.654000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Manhattan', '06:25:00', 3600, 6520, 58.98, 3.591010, 98.626520),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Saka Hotel', '06:29:00', 750, 7270, 58.23, 3.588000, 98.625000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Grand Jamee', '06:33:00', 950, 8220, 57.28, 3.585000, 98.624000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Sky View Apart', '06:47:00', 5200, 13420, 52.08, 3.565000, 98.635000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'The K-Hotel', '06:58:00', 3700, 17120, 48.38, 3.555000, 98.642000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Simpang Pos', '07:04:00', 2000, 19120, 46.38, 3.545000, 98.650000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Asrama Haji Medan', '07:11:00', 2800, 21920, 43.58, 3.535000, 98.658000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'RS Mitra Sejati', '07:16:00', 1600, 23520, 41.98, 3.532000, 98.665000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Simpang Marendal', '07:28:00', 4400, 27920, 37.58, 3.535000, 98.705000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Depan Bus ALS', '07:39:00', 3600, 31520, 33.98, 3.538000, 98.712000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'RS Mitra Medika Amp', '07:48:00', 2800, 34320, 31.18, 3.542000, 98.718000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Tol/Simpang Amplas', '07:52:00', 1200, 35520, 29.98, 3.540000, 98.715000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'KNO', '08:25:00', 30000, 65520, 0, 3.636000, 98.883000);

-- 4. Insert Pickup Points for Rayon C
INSERT INTO pickup_points (rayon_id, place_name, time_wib, distance_from_previous_mtr, cumulative_distance_mtr, jarak_ke_kno, latitude, longitude)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Adi Mulia', '06:00:00', 0, 0, 31.4, 3.585000, 98.674000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Santika', '06:03:00', 450, 450, 30.95, 3.588000, 98.675000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Arya Duta', '06:05:00', 240, 690, 30.71, 3.590000, 98.676000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Aston Grand City Hall', '06:08:00', 230, 920, 30.48, 3.592000, 98.677000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Grand Inna', '06:10:00', 130, 1050, 30.35, 3.593000, 98.678000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Reiz Suite Artotel', '06:13:00', 450, 1500, 29.9, 3.595000, 98.673000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Podomoro', '06:18:00', 700, 2200, 29.2, 3.595600, 98.672800),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'JW Marriot', '06:23:00', 750, 2950, 28.45, 3.597600, 98.674400),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Emerald Garden', '06:28:00', 750, 3700, 27.7, 3.602000, 98.676000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Grand Mercure', '06:38:00', 1600, 5300, 26.1, 3.605000, 98.685000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'RS Columbia Asia Aks', '06:50:00', 4800, 10100, 21.3, 3.595000, 98.715000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Tol Bandar Selamat', '06:55:00', 1300, 11400, 20.0, 3.598000, 98.725000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Tol KNO', '07:30:00', 20000, 31400, 0, 3.636000, 98.883000);

-- 5. Insert Pickup Points for Rayon D
INSERT INTO pickup_points (rayon_id, place_name, time_wib, distance_from_previous_mtr, cumulative_distance_mtr, jarak_ke_kno, latitude, longitude)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Hotel TD Pardede', '06:00:00', 0, 0, 64.0, 3.578000, 98.662000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Hermes Palace', '06:10:00', 2400, 2400, 61.6, 3.582154, 98.681840),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Ibis Styles', '06:21:00', 3500, 5900, 58.1, 3.585000, 98.655000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Fave Hotel', '06:24:00', 850, 6750, 57.25, 3.588000, 98.652000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Masjid Al Jihad', '06:29:00', 1300, 8050, 55.95, 3.592000, 98.648000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Hotel Deli', '06:31:00', 550, 8600, 55.4, 3.593000, 98.645000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Grand Central', '06:33:00', 350, 8950, 55.05, 3.594000, 98.643000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Grand Impression Hotel', '06:38:00', 1600, 10550, 53.45, 3.596000, 98.638000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'RAZ Hotel', '06:40:00', 550, 11100, 52.9, 3.597000, 98.635000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Rumah Sakit USU', '06:45:00', 1600, 12700, 51.3, 3.565000, 98.650000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Grand Dhika Hotel', '07:01:00', 2000, 14700, 49.3, 3.555000, 98.645000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Sky View Apart', '07:09:00', 2400, 17100, 46.9, 3.565000, 98.635000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Simpang Harmonika', '07:15:00', 1800, 18900, 45.1, 3.555000, 98.630000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Citra Garden', '07:23:00', 3700, 22600, 41.4, 3.545000, 98.635000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Simpang POS', '07:32:00', 2700, 25300, 38.7, 3.545000, 98.650000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Asrama Haji', '07:39:00', 2800, 28100, 35.9, 3.535000, 98.658000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Simpang Amplas', '07:55:00', 5900, 34000, 30.0, 3.540000, 98.715000),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Kualanamu', '08:32:00', 30000, 64000, 0, 3.636000, 98.883000);
