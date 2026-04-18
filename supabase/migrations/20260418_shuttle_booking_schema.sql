-- Shuttle Routes table
CREATE TABLE IF NOT EXISTS shuttle_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Shuttle Schedules table
CREATE TABLE IF NOT EXISTS shuttle_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES shuttle_routes(id) ON DELETE CASCADE,
  departure_time TIMESTAMP NOT NULL,
  arrival_time TIMESTAMP NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  price_regular BIGINT NOT NULL,
  price_executive BIGINT NOT NULL,
  price_vip BIGINT NOT NULL,
  available_seats INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Service Types lookup
CREATE TABLE IF NOT EXISTS shuttle_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);

-- Shuttle Bookings table
CREATE TABLE IF NOT EXISTS shuttle_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code TEXT NOT NULL UNIQUE,
  schedule_id UUID NOT NULL REFERENCES shuttle_schedules(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('regular', 'executive', 'vip')),
  passenger_name TEXT NOT NULL,
  passenger_phone TEXT NOT NULL,
  passenger_email TEXT,
  seats TEXT[] NOT NULL,
  total_price BIGINT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  payment_method TEXT,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  qr_code TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Booking Detail Seat Mapping
CREATE TABLE IF NOT EXISTS shuttle_booking_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES shuttle_bookings(id) ON DELETE CASCADE,
  seat_label TEXT NOT NULL,
  seat_position TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Insert default service types
INSERT INTO shuttle_services (code, name, description, icon) VALUES
  ('regular', 'Regular', 'Kursi standar dengan kenyamanan dasar', 'sofa'),
  ('executive', 'Executive', 'Kursi semi-reclining dengan legrest', 'crown'),
  ('vip', 'VIP', 'Kursi fully reclining dengan premium amenities', 'star')
ON CONFLICT (code) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shuttle_routes_active ON shuttle_routes(is_active);
CREATE INDEX IF NOT EXISTS idx_shuttle_schedules_route ON shuttle_schedules(route_id);
CREATE INDEX IF NOT EXISTS idx_shuttle_schedules_active ON shuttle_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_shuttle_bookings_code ON shuttle_bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_shuttle_bookings_schedule ON shuttle_bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_shuttle_bookings_status ON shuttle_bookings(status);
