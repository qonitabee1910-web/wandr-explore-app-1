# Shuttle Booking Feature - Integration Checklist

## ✅ Completed Tasks

### Core Implementation
- [x] Database schema created (5 tables with indexes)
- [x] TypeScript type definitions (shuttle-booking.ts)
- [x] Context API setup (ShuttleBookingContext.tsx)
- [x] SeatSelector component (interactive seat grid)
- [x] ShuttleBooking page (7-step booking flow)
- [x] QR code integration (qrcode library installed)
- [x] App.tsx routing updated
- [x] ShuttleBookingProvider wrapper added
- [x] Build verification (successful - no errors)

## 📋 Next Steps (Priority Order)

### 1. ⚠️ CRITICAL: Run Database Migrations
```bash
# Option A: Using Supabase CLI
supabase migration up

# Option B: Manual SQL in Supabase Dashboard
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Create new query
4. Copy content from: supabase/migrations/20260418_shuttle_booking_schema.sql
5. Run the query
6. Verify all 5 tables are created:
   - shuttle_routes
   - shuttle_schedules
   - shuttle_services
   - shuttle_bookings
   - shuttle_booking_seats
```

**Verification:**
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'shuttle_%';

-- Should show all 5 shuttle tables
```

### 2. ⚠️ CRITICAL: Add Driver Position Column (if not done)
```bash
# Option A: Using Supabase CLI
supabase migration up

# Option B: Manual SQL
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS driver_pos jsonb DEFAULT '{"x": 50, "y": 8}';
```

### 3. 🚀 Populate Sample Data
Run the following SQL in your Supabase SQL Editor:

```sql
-- Insert 3 sample routes
INSERT INTO shuttle_routes (name, slug, origin, destination, description, is_active) VALUES
  ('Bandara - Jakarta Pusat', 'bandara-jakarta-pusat', 'Bandar Soekarno-Hatta', 'Jakarta Pusat', 'Perjalanan dari Bandara Internasional Soekarno-Hatta ke Jakarta Pusat dengan armada kendaraan modern', true),
  ('Bandara - Subang', 'bandara-subang', 'Bandar Soekarno-Hatta', 'Subang', 'Perjalanan cepat dari Bandara ke Kota Subang dengan berbagai pilihan kelas', true),
  ('Jakarta Pusat - Bandung', 'jakarta-pusat-bandung', 'Jakarta Pusat', 'Bandung', 'Perjalanan nyaman dari Jakarta Pusat ke Kota Bandung - destinasi wisata populer', true)
ON CONFLICT DO NOTHING;

-- Insert sample schedules for each route
-- Get first 3 vehicles for scheduling
WITH route_data AS (
  SELECT id FROM shuttle_routes WHERE is_active = true LIMIT 3
),
vehicle_data AS (
  SELECT id FROM vehicles LIMIT 3
)
INSERT INTO shuttle_schedules (route_id, departure_time, arrival_time, vehicle_id, price_regular, price_executive, price_vip, available_seats, is_active)
SELECT 
  r.id,
  now() + (interval '1 hour' * (ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY r.id))),
  now() + (interval '3 hours' * (ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY r.id))),
  v.id,
  150000,  -- Regular class price
  250000,  -- Executive class price
  350000,  -- VIP class price
  13,      -- Available seats
  true
FROM route_data r, vehicle_data v
LIMIT 9;
```

### 4. 🔧 Verify Supabase RLS Policies
Ensure these policies exist (or create them):

```sql
-- shuttle_routes: Allow public read
CREATE POLICY "Allow public read" ON shuttle_routes
FOR SELECT USING (true);

-- shuttle_schedules: Allow public read
CREATE POLICY "Allow public read" ON shuttle_schedules
FOR SELECT USING (true);

-- shuttle_bookings: Allow public insert
CREATE POLICY "Allow public insert" ON shuttle_bookings
FOR INSERT WITH CHECK (true);

-- shuttle_bookings: Allow user read own bookings (optional)
CREATE POLICY "Allow read own bookings" ON shuttle_bookings
FOR SELECT USING (auth.email() = passenger_email OR passenger_email IS NULL);
```

### 5. ✨ Test the Feature
1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/shuttle-booking`
3. Test entire flow:
   - ✓ Step 1: Select a route
   - ✓ Step 2: Select a schedule
   - ✓ Step 3: Select service class
   - ✓ Step 4: Select seats
   - ✓ Step 5: Enter passenger info
   - ✓ Step 6: Confirm booking
   - ✓ Step 7: View ticket with QR code
4. Verify booking appears in `shuttle_bookings` table

### 6. 🎯 Add Booking Link to Home Page (Optional)
Edit `src/pages/Index.tsx` to add a booking button:

```jsx
<Link to="/shuttle-booking">
  <Button>Pesan Tiket Shuttle</Button>
</Link>
```

### 7. 💳 Payment Integration (Future)
When ready to add payment:
- Install Midtrans library: `npm install midtrans-client`
- Update Step 6 confirmation to process payment
- Update booking payment_status from 'unpaid' to 'paid'
- Implement payment webhook handler

### 8. 📧 Email Notifications (Future)
- Set up Supabase email function or use third-party SMTP
- Send confirmation email with booking code
- Include QR code in email

### 9. 📝 PDF Download (Future)
- Install html2pdf: `npm install html2pdf.js`
- Implement PDF generation on ticket screen
- Add download button functionality

## 📁 File Structure Summary

```
✅ Created/Updated:
├── src/pages/ShuttleBooking.tsx              (NEW - 450+ lines)
├── src/types/shuttle-booking.ts             (NEW - 70 lines)
├── src/context/ShuttleBookingContext.tsx    (NEW - 90 lines)
├── src/components/shuttle/SeatSelector.tsx  (NEW - 50 lines)
├── src/App.tsx                              (UPDATED - routing + provider)
├── supabase/migrations/20260418_shuttle_booking_schema.sql (NEW - 300+ lines)
└── docs/SHUTTLE_BOOKING_GUIDE.md            (NEW - comprehensive guide)
```

## 🧪 Testing Checklist

- [ ] Database migrations executed successfully
- [ ] Sample routes and schedules inserted
- [ ] /shuttle-booking route loads without errors
- [ ] Step 1: Routes display correctly
- [ ] Step 2: Schedules load for selected route
- [ ] Step 3: Service options show with pricing
- [ ] Step 4: Seats render and can be selected
- [ ] Step 5: Passenger form validates
- [ ] Step 6: Summary shows correct data
- [ ] Step 7: QR code generates and displays
- [ ] Booking appears in database
- [ ] Copy booking code works
- [ ] Download button is ready
- [ ] Back navigation works at each step

## 🚀 Quick Start Command

Run all at once (if using Supabase CLI):
```bash
npm run dev &  # Start dev server in background
supabase migration up  # Run migrations
```

Then open: `http://localhost:5173/shuttle-booking`

## 📞 Troubleshooting

### Error: "Cannot find module 'qrcode'"
- Already installed via npm
- Run: `npm install --legacy-peer-deps`

### Routes/Schedules not showing
- Check database tables exist
- Verify data inserted correctly
- Check Supabase connection string

### QR Code not generating
- Check browser console for errors
- Verify booking data structure

### Booking not saved
- Check Supabase RLS policies
- Verify table permissions
- Check network requests in DevTools

## 📚 Documentation Files

- [SHUTTLE_BOOKING_GUIDE.md](./SHUTTLE_BOOKING_GUIDE.md) - Complete feature guide
- [DRIVER_POS_MIGRATION.md](./DRIVER_POS_MIGRATION.md) - Driver position setup (if needed)

