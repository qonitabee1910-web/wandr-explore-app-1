# Shuttle Booking - Quick Start Guide

## 🚀 Launch Feature (Right Now!)

```bash
# 1. Start development server
npm run dev

# 2. Open browser
http://localhost:5173/shuttle-booking

# 3. You're done! Feature is live.
```

---

## ✅ Quick Verification Checklist

Before proceeding, verify all files exist:

```bash
# Files to verify exist:
src/pages/ShuttleBooking.tsx                    ✓
src/types/shuttle-booking.ts                   ✓
src/context/ShuttleBookingContext.tsx          ✓
src/components/shuttle/SeatSelector.tsx        ✓
supabase/migrations/20260418_shuttle_booking_schema.sql ✓

# Documentation files:
docs/SHUTTLE_BOOKING_GUIDE.md                  ✓
docs/SHUTTLE_BOOKING_INTEGRATION_CHECKLIST.md  ✓
docs/SHUTTLE_BOOKING_IMPLEMENTATION_SUMMARY.md ✓
```

---

## 🎯 What's Working Now

✅ **Route selection** - Browse available routes  
✅ **Schedule selection** - Pick departure time  
✅ **Service selection** - Choose Regular/Executive/VIP  
✅ **Seat selection** - Interactive seat map  
✅ **Passenger info** - Name, phone, email form  
✅ **Confirmation** - Review all details  
✅ **QR ticket** - Download with booking code  

---

## ⚠️ What's Not Working Until You Setup Database

❌ Routes won't show (no database data)  
❌ Bookings won't save (tables don't exist)  
❌ QR code will be empty (no booking data)  

---

## 🔧 Database Setup (15 minutes)

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project
2. Click **SQL Editor**
3. Click **New Query**

### Step 2: Run Migrations

**Copy and paste this SQL:**

```sql
-- Shuttle Booking Schema
CREATE TABLE IF NOT EXISTS shuttle_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shuttle_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shuttle_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES shuttle_routes(id) ON DELETE CASCADE,
  departure_time timestamp NOT NULL,
  arrival_time timestamp NOT NULL,
  vehicle_id uuid REFERENCES vehicles(id),
  price_regular numeric(10, 2),
  price_executive numeric(10, 2),
  price_vip numeric(10, 2),
  available_seats integer DEFAULT 13,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shuttle_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code text UNIQUE NOT NULL,
  schedule_id uuid REFERENCES shuttle_schedules(id),
  service_type text CHECK (service_type IN ('regular', 'executive', 'vip')),
  passenger_name text NOT NULL,
  passenger_phone text NOT NULL,
  passenger_email text,
  seats jsonb DEFAULT '[]',
  total_price numeric(10, 2),
  status text CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'confirmed',
  payment_method text,
  payment_status text CHECK (payment_status IN ('unpaid', 'paid', 'refunded')) DEFAULT 'unpaid',
  qr_code text,
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shuttle_booking_seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES shuttle_bookings(id) ON DELETE CASCADE,
  seat_label text,
  seat_position text,
  created_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_shuttle_routes_active ON shuttle_routes(is_active);
CREATE INDEX idx_shuttle_schedules_route ON shuttle_schedules(route_id);
CREATE INDEX idx_shuttle_schedules_active ON shuttle_schedules(is_active);
CREATE INDEX idx_shuttle_bookings_code ON shuttle_bookings(booking_code);
CREATE INDEX idx_shuttle_bookings_schedule ON shuttle_bookings(schedule_id);
CREATE INDEX idx_shuttle_bookings_status ON shuttle_bookings(status);

-- Default services
INSERT INTO shuttle_services (code, name, description, icon, is_active) VALUES
  ('regular', 'Regular', 'Kelas standar dengan kenyamanan dasar', 'bus', true),
  ('executive', 'Executive', 'Kelas bisnis dengan kenyamanan ekstra', 'armchair', true),
  ('vip', 'VIP', 'Kelas premium dengan fasilitas lengkap', 'crown', true)
ON CONFLICT DO NOTHING;
```

### Step 3: Insert Sample Routes & Schedules

```sql
-- Insert 3 sample routes
INSERT INTO shuttle_routes (name, slug, origin, destination, description, is_active) VALUES
  ('Bandara - Jakarta Pusat', 'bandara-jakarta-pusat', 'Bandar Soekarno-Hatta', 'Jakarta Pusat', 'Perjalanan dari Bandara Internasional Soekarno-Hatta ke Jakarta Pusat', true),
  ('Bandara - Subang', 'bandara-subang', 'Bandar Soekarno-Hatta', 'Subang', 'Perjalanan dari Bandara ke Kota Subang', true),
  ('Jakarta Pusat - Bandung', 'jakarta-pusat-bandung', 'Jakarta Pusat', 'Bandung', 'Perjalanan dari Jakarta Pusat ke Kota Bandung', true)
ON CONFLICT DO NOTHING;

-- Insert sample schedules
INSERT INTO shuttle_schedules (route_id, departure_time, arrival_time, vehicle_id, price_regular, price_executive, price_vip, available_seats, is_active)
SELECT 
  r.id,
  NOW() + INTERVAL '1 hour',
  NOW() + INTERVAL '3 hours',
  (SELECT id FROM vehicles LIMIT 1),
  150000,
  250000,
  350000,
  13,
  true
FROM shuttle_routes r
LIMIT 3;
```

### Step 4: Verify Tables Created

```sql
-- Should show all 5 tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'shuttle_%'
ORDER BY table_name;
```

---

## 🧪 Test the Feature

1. **Start server:** `npm run dev`
2. **Open:** `http://localhost:5173/shuttle-booking`
3. **You should see:**
   - ✅ 3 routes available
   - ✅ Click one route → see schedules
   - ✅ Click a schedule → see service options
   - ✅ Click service → see seats
   - ✅ Select seats → enter passenger info
   - ✅ Confirm → see ticket with QR code

---

## 🔍 Troubleshooting

### Issue: "No routes available"
**Solution:** Insert sample data (see Step 3 above)

### Issue: Routes load but schedules empty
**Solution:** Insert sample schedules (Step 3 SQL)

### Issue: QR code not showing
**Solution:** Check browser console for errors, restart dev server

### Issue: Build fails
**Solution:** Run `npm install --legacy-peer-deps`

---

## 📊 Feature Breakdown

| Step | What Happens |
|------|--------------|
| 1 | Select from list of routes |
| 2 | Select departure time |
| 3 | Choose service class & price |
| 4 | Click seats to select |
| 5 | Enter name, phone, email |
| 6 | Review all booking details |
| 7 | See ticket with QR code |

---

## 🎯 Key Points

1. **No login required** - Public feature
2. **Data comes from database** - Must run migrations & add sample data
3. **Real bookings saved** - Appear in `shuttle_bookings` table
4. **QR code generated** - Includes booking details
5. **Mobile responsive** - Works on all screen sizes

---

## 📞 Full Documentation

- **Setup Guide:** `docs/SHUTTLE_BOOKING_INTEGRATION_CHECKLIST.md`
- **Architecture:** `docs/SHUTTLE_BOOKING_GUIDE.md`
- **Status:** `docs/SHUTTLE_BOOKING_IMPLEMENTATION_SUMMARY.md`

---

## ⏱️ Time to First Working Feature

- Database setup: **5 minutes**
- Sample data: **2 minutes**
- Testing: **5 minutes**
- **Total: ~12 minutes**

---

## 🎉 You're Ready!

Follow the database setup above, then visit:  
**http://localhost:5173/shuttle-booking**

Feature is complete and waiting for you! 🚀

