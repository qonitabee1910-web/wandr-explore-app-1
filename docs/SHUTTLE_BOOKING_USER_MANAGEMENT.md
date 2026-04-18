# Shuttle Booking - User Management Features

## 🎯 Features Implemented

### 1. ✅ User Authentication Integration
- **File:** `src/pages/ShuttleBooking.tsx` (updated)
- **Features:**
  - Capture authenticated user's ID and email when booking
  - Optional authentication (non-authenticated users can still book)
  - `user_id` and `user_email` saved with each booking

### 2. ✅ User Profile & Booking History
- **File:** `src/pages/ShuttleBookingHistory.tsx` (NEW)
- **Access:** `/shuttle-booking-history` (Protected Route)
- **Features:**
  - View all personal shuttle bookings
  - Booking statistics (confirmed, cancelled, paid, total spent)
  - Search and filter bookings
  - View QR code for each booking
  - Cancel bookings (mark as cancelled)
  - View booking details in modal
  - Real-time booking status tracking

### 3. ✅ Admin Users Management Panel
- **File:** `src/pages/admin/AdminShuttleUsers.tsx` (NEW)
- **Access:** `/admin/shuttle-users` (Admin Only)
- **Features:**
  - View all user shuttle bookings
  - Search by name, booking code, phone, or email
  - Filter by booking status (confirmed, pending, cancelled)
  - Update booking status (confirmed → cancelled)
  - Update payment status (unpaid → paid → refunded)
  - View booking details
  - Revenue tracking
  - Booking statistics
  - Batch management actions

### 4. ✅ Database Schema Updates
- **File:** `supabase/migrations/20260418_add_user_id_to_shuttle_bookings.sql` (NEW)
- **Changes:**
  - Added `user_id` column (FK to auth.users)
  - Added `user_email` column (for display if user deleted)
  - Created indexes for performance
  - Backward compatible with existing bookings

---

## 📊 Data Flow

### Booking Creation Flow
```
User Login (optional)
    ↓
Browse Shuttle Booking (/shuttle-booking)
    ↓
Complete 7-step booking
    ↓
On Confirmation:
  - Capture user_id (if authenticated)
  - Capture user_email (if authenticated)
  - Insert booking with user data
    ↓
Booking saved to database
```

### User Viewing Their Bookings
```
User Login
    ↓
Navigate to /shuttle-booking-history
    ↓
Page queries shuttle_bookings WHERE user_id = current_user
    ↓
Display all their bookings with stats
    ↓
User can view QR code, cancel, download
```

### Admin Managing Bookings
```
Admin Login
    ↓
Navigate to /admin/shuttle-users
    ↓
Admin sees ALL bookings (all users)
    ↓
Admin can:
  - Search by passenger info
  - Filter by status
  - Update booking status
  - Update payment status
  - View details
```

---

## 🔌 Database Tables

### Modified: shuttle_bookings

| Column | Type | Description |
|--------|------|-------------|
| **NEW** user_id | uuid FK | Reference to auth.users |
| **NEW** user_email | text | User email at time of booking |
| booking_code | text | Unique booking identifier |
| passenger_name | text | Passenger full name |
| passenger_phone | text | Passenger phone number |
| passenger_email | text | Passenger email (may differ from user_email) |
| seats | text[] | Array of seat IDs booked |
| total_price | bigint | Total booking price |
| status | text | pending, confirmed, cancelled |
| payment_status | text | unpaid, paid, refunded |
| created_at | timestamp | Booking creation time |

### Indexes Added
```sql
CREATE INDEX idx_shuttle_bookings_user ON shuttle_bookings(user_id);
CREATE INDEX idx_shuttle_bookings_user_created ON shuttle_bookings(user_id, created_at DESC);
```

---

## 🛣️ Routes Added

### Protected Routes (Authenticated Users)
| Route | Component | Purpose |
|-------|-----------|---------|
| `/shuttle-booking` | ShuttleBooking | Book shuttle tickets |
| `/shuttle-booking-history` | ShuttleBookingHistory | View personal booking history |

### Admin Routes (Admin Only)
| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin/shuttle-users` | AdminShuttleUsers | Manage all user bookings |

---

## 💾 Database Migration

### Run the Migration

```bash
# Option A: Using Supabase CLI
supabase migration up

# Option B: Manual SQL in Supabase Dashboard
-- Run SQL from:
supabase/migrations/20260418_add_user_id_to_shuttle_bookings.sql
```

### SQL Content
```sql
ALTER TABLE shuttle_bookings 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_shuttle_bookings_user ON shuttle_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_shuttle_bookings_user_created ON shuttle_bookings(user_id, created_at DESC);

ALTER TABLE shuttle_bookings 
ADD COLUMN IF NOT EXISTS user_email text;
```

---

## 🔐 RLS Policies (Recommended)

### For shuttle_bookings Table

```sql
-- Users can view own bookings
CREATE POLICY "Users can view own bookings" ON shuttle_bookings
FOR SELECT USING (
  auth.uid() = user_id OR passenger_email = auth.email()
);

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON shuttle_bookings
FOR INSERT WITH CHECK (true);

-- Users can cancel own bookings
CREATE POLICY "Users can update own bookings" ON shuttle_bookings
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admin can manage all bookings (create separate admin role check)
CREATE POLICY "Admins can manage all bookings" ON shuttle_bookings
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND role = 'admin')
);
```

---

## 🎨 User Workflows

### Workflow 1: User Booking & Tracking

1. **Browse (No Login Required)**
   - Navigate to `/shuttle-booking`
   - Browse routes, select schedule, choose service, select seats
   - Enter passenger info (name, phone required; email optional)
   - Confirm booking

2. **If Authenticated**
   - User ID captured automatically
   - Booking linked to their account
   - They can track it in `/shuttle-booking-history`

3. **View History**
   - Login to app
   - Go to `/shuttle-booking-history`
   - See all their bookings
   - View status, QR codes, etc.

### Workflow 2: Admin Booking Management

1. **View All Bookings**
   - Login as admin
   - Go to `/admin/shuttle-users`
   - See table of all user bookings

2. **Search & Filter**
   - Search by passenger name, booking code, phone
   - Filter by booking status
   - See revenue total

3. **Manage Bookings**
   - Click dropdown menu on booking
   - Update status (mark confirmed, cancel)
   - Update payment (mark paid, refund)
   - View full details

---

## 📋 Feature Breakdown

### ShuttleBookingHistory Page
- **Authentication:** Required (ProtectedRoute)
- **Displays:**
  - User account info
  - Statistics (confirmed/cancelled/paid count, total spent)
  - List of all user's bookings with filters
  - Search functionality
  - QR code view modal
  - Cancel button for non-cancelled bookings
  - Download ticket option (UI ready)

### AdminShuttleUsers Page
- **Authentication:** Admin only
- **Displays:**
  - Search bar (name, booking code, phone, email)
  - Status filter dropdown
  - Revenue summary
  - Table with all bookings
  - Columns: Code, Passenger, Route, Price, Status, Payment, Date, Actions
  - Dropdown menu for each booking
  - Detail modal with full information

---

## 🔄 Updated ShuttleBooking Component

### Changes Made
```typescript
// Added imports
import { useUserAuth } from '@/context/UserAuthContext';
import { LogIn } from 'lucide-react';

// In component
const { user, isAuthenticated } = useUserAuth();

// In booking creation (confirmation step)
const { data: booking, error } = await supabase
  .from('shuttle_bookings')
  .insert({
    booking_code: bookingCode,
    user_id: user?.id || null,          // NEW
    user_email: user?.email || null,    // NEW
    schedule_id: session.selectedSchedule!.id,
    service_type: session.selectedService,
    passenger_name: session.passengerName,
    passenger_phone: session.passengerPhone,
    passenger_email: session.passengerEmail,
    seats: session.selectedSeats,
    total_price: totalPrice,
    status: 'confirmed',
    payment_status: 'unpaid',
  })
  .select()
  .single();
```

---

## 📁 File Structure

```
src/
├── pages/
│   ├── ShuttleBooking.tsx              (UPDATED - add user_id to insert)
│   ├── ShuttleBookingHistory.tsx       (NEW - user booking history)
│   └── admin/
│       └── AdminShuttleUsers.tsx       (NEW - admin booking management)
└── App.tsx                            (UPDATED - added routes)

supabase/migrations/
└── 20260418_add_user_id_to_shuttle_bookings.sql  (NEW)
```

---

## ✅ Testing Checklist

- [ ] Database migration executed successfully
- [ ] New columns visible in Supabase dashboard
- [ ] ShuttleBooking page still works (non-auth users)
- [ ] Non-auth users can complete booking
- [ ] Auth users see their bookings in history page
- [ ] `/shuttle-booking-history` loads for logged-in users
- [ ] `/shuttle-booking-history` redirects for non-auth users
- [ ] User can search/filter their bookings
- [ ] User can view QR code for booking
- [ ] User can cancel booking
- [ ] Admin can access `/admin/shuttle-users`
- [ ] Admin can search bookings
- [ ] Admin can filter by status
- [ ] Admin can update booking status
- [ ] Admin can update payment status
- [ ] Admin can view booking details
- [ ] Build passes without errors: `npm run build`
- [ ] No TypeScript errors

---

## 🚀 Next Steps

### Immediate
1. Run database migration
2. Test booking flow (both auth and non-auth)
3. Test user history page
4. Test admin management page

### Short Term
1. Add email notifications on booking
2. Add booking modification (edit passenger info)
3. Add refund logic
4. Add promo codes

### Future
1. Payment gateway integration
2. Booking analytics dashboard
3. User loyalty program
4. Booking cancellation with auto-refund

---

## 📞 Support

### Issues?

**Bookings not appearing in user history:**
- Verify user is logged in
- Check user_id is populated in database
- Check Supabase RLS policies allow read

**Admin can't see bookings:**
- Verify user has admin role
- Check AdminRoute component works
- Check query permissions

**Migration failed:**
- Already have column? That's OK - IF NOT EXISTS prevents errors
- Check Supabase credentials
- Try manual SQL in dashboard

---

## 🎊 Summary

✅ **User Management Complete**

Users can now:
- Book shuttles (with or without login)
- View all their bookings in one place
- Track booking status in real-time
- Cancel bookings
- Download tickets with QR codes

Admins can now:
- View all user bookings
- Search by passenger details
- Update booking & payment status
- Track revenue
- Manage entire booking system

**Status:** Ready for database migration and testing! 🚀

