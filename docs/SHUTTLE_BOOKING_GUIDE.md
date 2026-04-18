# Shuttle Booking Feature - Complete Implementation Guide

## Overview
The Shuttle Booking feature enables users (without login required) to:
- Browse available routes
- Select departure schedules
- Choose service class (Regular, Executive, VIP)
- Select specific seats on the shuttle
- Enter passenger information
- Confirm booking and receive a ticket with QR code

## Architecture

### Database Schema

#### Tables Created:
1. **shuttle_routes** - Available shuttle routes
2. **shuttle_schedules** - Schedules for each route
3. **shuttle_services** - Service types (regular, executive, vip)
4. **shuttle_bookings** - Booking records
5. **shuttle_booking_seats** - Seat mapping for bookings

### Type Definitions
Location: `src/types/shuttle-booking.ts`

### Context & State Management
Location: `src/context/ShuttleBookingContext.tsx`

Uses React Context to manage booking flow state:
- Current step tracking
- Selected route, schedule, service
- Selected seats
- Passenger information
- Total price calculation

## Booking Flow

### Step 1: Route Selection
- User selects a route from available options
- Routes can be filtered by origin/destination

### Step 2: Schedule Selection
- Shows available schedules for selected route
- Displays departure/arrival times
- Shows available seats count

### Step 3: Service Selection
- Regular: Basic comfort with standard amenities
- Executive: Semi-reclining seats with premium amenities
- VIP: Full-reclining seats with luxury amenities
- Price varies by service class

### Step 4: Seat Selection
- Interactive seat map with driver position
- Selectable seats based on service class
- Multiple seat selection supported
- Real-time price calculation

### Step 5: Passenger Information
- Required: Name, Phone
- Optional: Email
- Form validation before proceeding

### Step 6: Confirmation
- Review all booking details
- Confirm route, schedule, service, seats, and passenger info
- Proceed to ticket/download

### Step 7: Ticket Generation
- Booking code generated (BK + timestamp)
- QR code displayed with booking details
- Option to download ticket
- Copy booking code functionality

## File Structure

```
src/
├── pages/
│   └── ShuttleBooking.tsx          # Main booking flow page
├── types/
│   └── shuttle-booking.ts          # Type definitions
├── context/
│   └── ShuttleBookingContext.tsx    # State management
├── components/shuttle/
│   └── SeatSelector.tsx            # Seat selection component
└── supabase/migrations/
    └── 20260418_shuttle_booking_schema.sql  # Database schema
```

## Component Details

### ShuttleBooking.tsx
Multi-step form with 7 steps:
- Route selection
- Schedule selection
- Service selection
- Seat selection
- Passenger info form
- Booking confirmation
- Ticket display with QR code

Features:
- Loads routes, schedules, and seats dynamically
- Real-time price calculation
- Form validation
- Error handling with toast notifications
- Supabase integration for booking persistence

### SeatSelector.tsx
Interactive seat map component:
- Displays driver position
- Shows selectable seats arranged in rows
- Click to toggle seat selection
- Multiple selection support
- Responsive design

### ShuttleBookingContext.tsx
Context provider managing:
- Current step in booking flow
- Selected route/schedule/service
- Selected seats
- Passenger information
- Total price calculation
- State reset for new bookings

## Database Operations

### Insert Booking
```typescript
const { data: booking, error } = await supabase
  .from('shuttle_bookings')
  .insert({
    booking_code: bookingCode,
    schedule_id: scheduleId,
    service_type: serviceType,
    passenger_name: name,
    passenger_phone: phone,
    passenger_email: email,
    seats: selectedSeats,
    total_price: total,
    status: 'confirmed',
    payment_status: 'unpaid',
  })
  .select()
  .single();
```

### Query Routes
```typescript
const { data: routes } = await supabase
  .from('shuttle_routes')
  .select('*')
  .eq('is_active', true)
  .order('created_at', { ascending: true });
```

### Query Schedules
```typescript
const { data: schedules } = await supabase
  .from('shuttle_schedules')
  .select('*, route:shuttle_routes(*), vehicle:vehicles(*)')
  .eq('route_id', routeId)
  .eq('is_active', true)
  .gte('departure_time', nowISO)
  .order('departure_time', { ascending: true });
```

## Setup Instructions

### 1. Run Database Migration
Execute the migration SQL in your Supabase dashboard:
```bash
# Via Supabase CLI
supabase migration up

# Or manually in SQL editor
-- Run: supabase/migrations/20260418_shuttle_booking_schema.sql
```

### 2. Install Dependencies
```bash
npm install qrcode --legacy-peer-deps
```

### 3. Insert Sample Data
Use the SQL sample data below to populate routes and schedules.

### 4. Update App.tsx
Already done - route added at `/shuttle-booking`

## Sample SQL Data

```sql
-- Insert sample routes
INSERT INTO shuttle_routes (name, slug, origin, destination, description, is_active) VALUES
  ('Bandara - Jakarta Pusat', 'bandara-jakarta-pusat', 'Bandar Soekarno-Hatta', 'Jakarta Pusat', 'Perjalanan dari Bandara Internasional Soekarno-Hatta ke Jakarta Pusat', true),
  ('Bandara - Subang', 'bandara-subang', 'Bandar Soekarno-Hatta', 'Subang', 'Perjalanan dari Bandara ke Kota Subang', true),
  ('Jakarta Pusat - Bandung', 'jakarta-pusat-bandung', 'Jakarta Pusat', 'Bandung', 'Perjalanan dari Jakarta Pusat ke Kota Bandung', true);

-- Insert sample schedules (replace vehicle_id with actual vehicle IDs)
INSERT INTO shuttle_schedules (route_id, departure_time, arrival_time, vehicle_id, price_regular, price_executive, price_vip, available_seats, is_active)
SELECT 
  id,
  now() + interval '1 hour',
  now() + interval '3 hours',
  (SELECT id FROM vehicles LIMIT 1),
  150000,
  250000,
  350000,
  13,
  true
FROM shuttle_routes
LIMIT 3;
```

## Features

### ✅ Implemented
- [x] No login required
- [x] Browse routes dynamically
- [x] Select schedules
- [x] Choose service class with descriptions
- [x] Interactive seat selection
- [x] Passenger information form
- [x] Booking confirmation
- [x] QR code generation
- [x] Booking code with copy functionality
- [x] Responsive UI design
- [x] Form validation
- [x] Error handling with toast notifications
- [x] Database persistence
- [x] Step-by-step navigation

### 🔄 Future Enhancements
- [ ] Payment gateway integration
- [ ] Email confirmation
- [ ] SMS notifications
- [ ] Ticket PDF download
- [ ] Booking modification
- [ ] Cancellation with refund
- [ ] Promo code support
- [ ] Multi-language support

## Navigation

- Access at: `/shuttle-booking`
- No authentication required
- Can access from home page
- Returns to home after booking completion

## UI/UX Features

1. **Progressive Disclosure** - One step at a time
2. **Real-time Validation** - Form field validation
3. **Error Handling** - Toast notifications for errors
4. **Loading States** - Skeleton screens and spinners
5. **Visual Feedback** - Button states, selected items
6. **Mobile Responsive** - Optimized for all screen sizes
7. **Accessibility** - Proper ARIA labels and keyboard navigation

## Supabase RLS Policies

Note: Currently, Supabase RLS policies should allow:
- Public read access to `shuttle_routes` and `shuttle_schedules`
- Public insert to `shuttle_bookings`
- Authentication not required for booking

Configure RLS policies as needed for your security requirements.

