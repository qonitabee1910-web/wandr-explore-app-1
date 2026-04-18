# Shuttle Booking User Management - Quick Implementation Guide

## 🚀 Start Here

You've now got **complete user management** for shuttle bookings. Here's what was added:

### New Features
1. ✅ User booking history page (`/shuttle-booking-history`)
2. ✅ Admin booking management panel (`/admin/shuttle-users`)
3. ✅ User ID tracking in bookings
4. ✅ Booking search & filtering
5. ✅ Status & payment management

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Database Migration

**Copy & Paste this SQL in Supabase Dashboard:**

```sql
ALTER TABLE shuttle_bookings 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_shuttle_bookings_user ON shuttle_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_shuttle_bookings_user_created ON shuttle_bookings(user_id, created_at DESC);

ALTER TABLE shuttle_bookings 
ADD COLUMN IF NOT EXISTS user_email text;
```

### Step 2: (Optional) Add RLS Policies

```sql
-- Users can view own bookings
CREATE POLICY "Users can view own bookings" ON shuttle_bookings
FOR SELECT USING (auth.uid() = user_id OR passenger_email = auth.email());

-- Anyone can create bookings
CREATE POLICY "Anyone can create bookings" ON shuttle_bookings
FOR INSERT WITH CHECK (true);
```

### Step 3: Test It

**Start dev server:**
```bash
npm run dev
```

**Test flows:**

**Non-authenticated user:**
1. Go to `http://localhost:5173/shuttle-booking`
2. Complete booking (no login required)
3. Should work fine

**Authenticated user:**
1. Login first
2. Go to `http://localhost:5173/shuttle-booking`
3. Complete booking
4. Go to `http://localhost:5173/shuttle-booking-history`
5. Should see your booking

**Admin:**
1. Login with admin account
2. Go to `http://localhost:5173/admin/shuttle-users`
3. Should see all user bookings

---

## 📁 Files Created/Updated

| File | Status | Purpose |
|------|--------|---------|
| `supabase/migrations/20260418_add_user_id_to_shuttle_bookings.sql` | NEW | Database schema update |
| `src/pages/ShuttleBookingHistory.tsx` | NEW | User booking history page |
| `src/pages/admin/AdminShuttleUsers.tsx` | NEW | Admin booking management |
| `src/pages/ShuttleBooking.tsx` | UPDATED | Add user_id to booking insert |
| `src/App.tsx` | UPDATED | Add new routes |

---

## 🔗 New Routes

### For Users
- **Booking History:** `/shuttle-booking-history` (Protected - requires login)
- **Make Booking:** `/shuttle-booking` (Public - no login required)

### For Admins  
- **Manage Bookings:** `/admin/shuttle-users` (Admin only)

---

## 🎯 User Workflows

### User: View My Bookings
```
1. Login
2. Click "Riwayat Booking Shuttle" (or go to /shuttle-booking-history)
3. See all your bookings
4. Search/filter if needed
5. Click booking to see QR code or details
6. Can cancel if not already cancelled
```

### Admin: Manage All Bookings
```
1. Login as admin
2. Go to Admin → "Shuttle Users" (or /admin/shuttle-users)
3. Search bookings by name/code/phone/email
4. Filter by status
5. Update booking status or payment status
6. View full details
```

---

## 📊 What Gets Tracked

**When user books:**
- ✅ Their user ID (if logged in)
- ✅ Their email (if logged in)
- ✅ Passenger name, phone, email
- ✅ Selected seats
- ✅ Total price
- ✅ Booking status
- ✅ Payment status

**Admin can see:**
- ✅ All this information for all users
- ✅ Search by passenger details
- ✅ Filter by status
- ✅ Update statuses
- ✅ Track revenue

---

## 🔒 Security Notes

**Non-authenticated bookings:**
- Anyone can book without login
- Data is public
- No personal account needed

**Authenticated bookings:**
- User ID is captured
- Can view own bookings only
- Admin can view all with higher privileges

**Admin access:**
- Admin role required
- Can see all bookings
- Can manage statuses
- Can track financials

---

## ✨ Features Included

### User Booking History Page
- ✅ View all personal bookings
- ✅ Booking statistics (confirmed, cancelled, paid, etc.)
- ✅ Search bookings
- ✅ Filter by status
- ✅ View QR code per booking
- ✅ Cancel bookings
- ✅ Download ticket (UI ready)

### Admin Management Panel
- ✅ View all bookings from all users
- ✅ Search by name/code/phone/email
- ✅ Filter by status
- ✅ Update booking status
- ✅ Update payment status
- ✅ View detailed info
- ✅ Revenue tracking

### Booking Form (Updated)
- ✅ Captures user ID if authenticated
- ✅ Still works for non-auth users
- ✅ Saves user email for reference

---

## 🧪 Test Scenarios

### Scenario 1: Non-Auth User Books
1. Go to `/shuttle-booking` (don't login)
2. Complete all 7 steps
3. Get QR ticket
4. Can't see in history (no login)
5. ✅ Should work

### Scenario 2: Auth User Books & Tracks
1. Login first
2. Go to `/shuttle-booking`
3. Complete booking
4. Go to `/shuttle-booking-history`
5. See your booking
6. ✅ Should appear instantly

### Scenario 3: Admin Manages
1. Logout, login as admin
2. Go to `/admin` dashboard
3. Click "Shuttle Users"
4. Search for booking code
5. Update status to "confirmed"
6. ✅ Should update in database

---

## 📞 Troubleshooting

### "Cannot find page" at `/shuttle-booking-history`
- **Check:** Are you logged in? It's a protected route
- **Fix:** Login first, then navigate

### "Not authorized" in admin panel
- **Check:** Is your user an admin?
- **Fix:** Check `user_roles` table, ensure role is 'admin'

### Bookings not showing in history
- **Check:** Did you login before booking?
- **Fix:** Only authenticated bookings appear in history. Non-auth bookings won't show.

### Database error on migration
- **Check:** Did columns already exist?
- **Fix:** "IF NOT EXISTS" prevents errors. Safe to re-run.

### Build errors
- **Check:** Run `npm install --legacy-peer-deps`
- **Fix:** Should be ~8 seconds build time, no errors

---

## 💡 Next Features (Optional)

1. **Refund Processing** - Auto-refund for cancelled bookings
2. **Email Notifications** - Send updates to user
3. **PDF Download** - Download ticket as PDF
4. **Booking Modification** - Edit passenger info
5. **Analytics Dashboard** - Revenue, booking trends

---

## ⏱️ Time Estimate

- Database migration: **2 minutes**
- Testing workflows: **5 minutes**
- Total: **~7 minutes**

---

## 🎊 You're Done!

User management features are complete and ready to use.

**Next action:** Run the database migration above, then test the three workflows.

Questions? See full docs: `docs/SHUTTLE_BOOKING_USER_MANAGEMENT.md`

