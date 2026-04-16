# Wandr-Explore-App: Supabase Integration Plan

**Status:** Pre-Implementation | **Date:** April 16, 2026  
**Skills Applied:** Senior Backend Engineer (Supabase), Senior Fullstack Engineer, Postgres Best Practices

---

## TABLE OF CONTENTS
1. [Project Context](#project-context)
2. [Architecture Overview](#architecture-overview)
3. [Phase 1: Database Design & Setup](#phase-1-database-design--setup)
4. [Phase 2: Authentication & Security](#phase-2-authentication--security)
5. [Phase 3: Service Layer Migration](#phase-3-service-layer-migration)
6. [Phase 4: Real-time Features & Testing](#phase-4-real-time-features--testing)
7. [Deployment & Rollout](#deployment--rollout)

---

## PROJECT CONTEXT

### Current State
- ✅ 50+ React components with mock data
- ✅ 3 operational modules (Shuttle, Ride, Hotel, Account, Promo)
- ✅ Real-time fare calculation engine (FareCalculator)
- ✅ External API integration (OSRM routing, Nominatim geocoding)
- ✅ Comprehensive UI with Shadcn components
- ⚠️ All data is mocked; no persistent backend

### Supabase Integration Goals
1. **Persistence:** Move mock data to PostgreSQL
2. **Authentication:** Supabase Auth with email/password + social
3. **Real-time:** Live booking updates, fare recalculation
4. **Security:** Row-Level Security (RLS) for data isolation
5. **Scalability:** Edge Functions for complex calculations
6. **Storage:** Images for hotels, promos, user avatars
7. **Analytics:** Transaction logging & audit trails

### Tech Stack Integration
```
Current Frontend          →  New Backend
─────────────────────────────────────────
React Pages/Components    →  Supabase REST API + Realtime
Mock Service Layer        →  Supabase JS Client + Custom Services
React Context (Shuttle)   →  Supabase Realtime + Context
localStorage (history)    →  PostgreSQL transactions table
Static mock data          →  PostgreSQL + RLS policies
External APIs (OSRM/Nom)  →  Unchanged (still external)
```

---

## ARCHITECTURE OVERVIEW

### High-Level Data Flow

```
User Interface (React)
        ↓
Service Layer (Refactored)
├─ ShuttleService (new)
├─ RideService (new)
├─ HotelService (new)
├─ AuthService (new)
├─ FareService (updated)
└─ TransactionService (new)
        ↓
Supabase JS Client
├─ REST API calls
├─ Realtime subscriptions
└─ Auth management
        ↓
Supabase Backend
├─ PostgreSQL Database
│  ├─ Users & Auth
│  ├─ Bookings (shuttle/ride/hotel)
│  ├─ Fare Rules & Pricing
│  ├─ Promo Codes
│  └─ Transactions
├─ Auth (JWT-based)
├─ Realtime (WebSocket)
├─ Edge Functions (complex logic)
└─ Storage (images)
```

### Key Design Principles

1. **Single Source of Truth:** Database is authoritative, client caches when needed
2. **RLS First:** Every table has row-level security policies
3. **Audit Trail:** All mutations logged with timestamps and user context
4. **Separation of Concerns:** 
   - Database layer: Schema, migrations, RLS
   - Service layer: Business logic, Supabase client calls
   - Component layer: UI only (no direct DB access)
5. **Performance:** Indexes on all foreign keys and filter columns
6. **Type Safety:** TypeScript interfaces match database schema

---

## PHASE 1: DATABASE DESIGN & SETUP

### 1.1 Supabase Project Setup

```bash
# Prerequisites
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-react

# Create .env.local
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key-from-dashboard]
```

### 1.2 Database Schema (PostgreSQL)

**Architecture Decision:** Normalized 3NF schema with audit columns.

#### Table: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  preferred_payment_method TEXT CHECK (
    preferred_payment_method IN ('credit_card', 'debit_card', 'e_wallet')
  ),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL,
  
  CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

**Why 3NF:** Eliminates data redundancy, maintains referential integrity.

**Audit Trail:** `created_at`, `updated_at` with trigger-based updates.

---

#### Table: `shuttle_rayons`
```sql
CREATE TABLE shuttle_rayons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  destination TEXT NOT NULL,
  base_price INT NOT NULL CHECK (base_price > 0),
  distance_km INT NOT NULL CHECK (distance_km > 0),
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_shuttle_rayons_name ON shuttle_rayons(name);
```

**Data:** 4 rayons (RAYON-A, B, C, D) with base prices 120k-135k IDR.

---

#### Table: `shuttle_pickup_points`
```sql
CREATE TABLE shuttle_pickup_points (
  id TEXT PRIMARY KEY,
  rayon_id TEXT NOT NULL REFERENCES shuttle_rayons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  distance_from_airport_meters INT NOT NULL CHECK (distance_from_airport_meters > 0),
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  
  CONSTRAINT unique_pickup_per_rayon UNIQUE(rayon_id, name)
);

CREATE INDEX idx_pickup_points_rayon_id ON shuttle_pickup_points(rayon_id);
CREATE INDEX idx_pickup_points_geo ON shuttle_pickup_points(latitude, longitude);
```

**Geospatial Index:** PostGIS extension enables location-based queries.

---

#### Table: `shuttle_schedules`
```sql
CREATE TABLE shuttle_schedules (
  id TEXT PRIMARY KEY,
  rayon_id TEXT NOT NULL REFERENCES shuttle_rayons(id) ON DELETE CASCADE,
  departure_time TIME NOT NULL,
  estimated_arrival_time TIME NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  available_seats INT NOT NULL CHECK (available_seats >= 0),
  status TEXT DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled')
  ),
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL,
  
  CONSTRAINT valid_times CHECK (departure_time < estimated_arrival_time)
);

CREATE INDEX idx_schedules_rayon_status ON shuttle_schedules(rayon_id, status);
CREATE INDEX idx_schedules_departure_time ON shuttle_schedules(departure_time);
```

**Real-time Considerations:** Subscribe to `status` changes for live updates.

---

#### Table: `fare_rules`
```sql
CREATE TABLE fare_rules (
  id TEXT PRIMARY KEY,
  rayon_id TEXT NOT NULL REFERENCES shuttle_rayons(id) ON DELETE CASCADE,
  base_fare INT NOT NULL CHECK (base_fare > 0),
  per_km_rate INT NOT NULL CHECK (per_km_rate > 0),
  min_charge INT NOT NULL CHECK (min_charge > 0),
  service_multiplier_regular DECIMAL(3, 2) DEFAULT 1.0,
  service_multiplier_semi_exec DECIMAL(3, 2) DEFAULT 1.5,
  service_multiplier_executive DECIMAL(3, 2) DEFAULT 2.0,
  vehicle_multiplier_mini DECIMAL(3, 2) DEFAULT 1.0,
  vehicle_multiplier_suv DECIMAL(3, 2) DEFAULT 1.2,
  vehicle_multiplier_hiace DECIMAL(3, 2) DEFAULT 1.5,
  passenger_multiplier_adult DECIMAL(3, 2) DEFAULT 1.0,
  passenger_multiplier_child DECIMAL(3, 2) DEFAULT 0.75,
  passenger_multiplier_senior DECIMAL(3, 2) DEFAULT 0.85,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_fare_rules_rayon_active ON fare_rules(rayon_id, is_active);
```

**Design Note:** Normalized multipliers per table vs wide columns. Chose wide columns for simplicity; consider normalization if multipliers change frequently.

---

#### Table: `surge_rules`
```sql
CREATE TABLE surge_rules (
  id TEXT PRIMARY KEY,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  days_of_week INT[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  multiplier DECIMAL(3, 2) NOT NULL CHECK (multiplier >= 1.0),
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL,
  
  CONSTRAINT valid_surge_times CHECK (start_time < end_time)
);

CREATE INDEX idx_surge_rules_active_days ON surge_rules(is_active)
WHERE days_of_week && ARRAY[EXTRACT(DOW FROM now())::int];
```

**Array Type:** `INT[]` for days of week (0=Sunday, 6=Saturday).

---

#### Table: `promo_codes`
```sql
CREATE TABLE promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INT NOT NULL CHECK (discount_value > 0),
  min_spend INT,
  max_discount INT,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  max_uses INT,
  current_uses INT DEFAULT 0,
  applicable_modules TEXT[] DEFAULT '{shuttle,ride,hotel}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL,
  
  CONSTRAINT valid_dates CHECK (valid_from <= valid_until),
  CONSTRAINT discount_limit CHECK (
    discount_type = 'percentage' AND discount_value <= 100
    OR discount_type = 'fixed'
  )
);

CREATE INDEX idx_promo_codes_code_active ON promo_codes(code, is_active);
CREATE INDEX idx_promo_codes_valid_dates ON promo_codes(valid_from, valid_until)
WHERE is_active = true;
```

**Constraints:** Percentage discounts capped at 100%, date validation.

---

#### Table: `bookings`
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_type TEXT NOT NULL CHECK (
    booking_type IN ('shuttle', 'ride', 'hotel')
  ),
  booking_status TEXT DEFAULT 'pending' CHECK (
    booking_status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')
  ),
  
  -- Shuttle-specific fields
  shuttle_schedule_id TEXT REFERENCES shuttle_schedules(id),
  shuttle_rayon_id TEXT REFERENCES shuttle_rayons(id),
  pickup_point_id TEXT REFERENCES shuttle_pickup_points(id),
  service_tier TEXT CHECK (
    service_tier IS NULL OR service_tier IN ('Regular', 'Semi Executive', 'Executive')
  ),
  vehicle_type TEXT CHECK (
    vehicle_type IS NULL OR vehicle_type IN ('Mini Car', 'SUV', 'Hiace')
  ),
  selected_seats TEXT[], -- Array of seat IDs
  
  -- Ride-specific fields
  ride_pickup_location TEXT,
  ride_pickup_lat DECIMAL(10, 8),
  ride_pickup_lng DECIMAL(11, 8),
  ride_dropoff_location TEXT,
  ride_dropoff_lat DECIMAL(10, 8),
  ride_dropoff_lng DECIMAL(11, 8),
  ride_type TEXT CHECK (
    ride_type IS NULL OR ride_type IN ('instant', 'scheduled')
  ),
  
  -- Hotel-specific fields
  hotel_id TEXT,
  checkin_date DATE,
  checkout_date DATE,
  room_type TEXT,
  number_of_rooms INT,
  
  -- Passengers
  passenger_count INT NOT NULL CHECK (passenger_count > 0),
  passengers_breakdown JSONB NOT NULL, -- {"adult": 2, "child": 1, "senior": 0}
  
  -- Pricing
  base_fare INT NOT NULL CHECK (base_fare > 0),
  distance_km DECIMAL(8, 2),
  distance_fare INT,
  service_surcharge INT,
  vehicle_surcharge INT,
  surge_surcharge INT,
  promo_code_used TEXT REFERENCES promo_codes(code),
  promo_discount INT DEFAULT 0 CHECK (promo_discount >= 0),
  round_trip_discount INT DEFAULT 0 CHECK (round_trip_discount >= 0),
  total_fare INT NOT NULL CHECK (total_fare > 0),
  
  -- Payment
  payment_method TEXT NOT NULL CHECK (
    payment_method IN ('credit_card', 'debit_card', 'e_wallet')
  ),
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')
  ),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  CONSTRAINT shuttle_requires_fields CHECK (
    (booking_type != 'shuttle' OR (shuttle_schedule_id IS NOT NULL AND pickup_point_id IS NOT NULL))
  ),
  CONSTRAINT ride_requires_fields CHECK (
    (booking_type != 'ride' OR (ride_pickup_location IS NOT NULL AND ride_dropoff_location IS NOT NULL))
  )
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_type_status ON bookings(booking_type, booking_status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_bookings_shuttle_schedule ON bookings(shuttle_schedule_id)
WHERE booking_type = 'shuttle';
```

**JSONB for Flexibility:** Passengers breakdown as JSONB allows flexible structure without schema changes.

**Partial Indexes:** WHERE clauses improve query performance for common filters.

---

#### Table: `transactions`
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  transaction_type TEXT NOT NULL CHECK (
    transaction_type IN ('booking', 'cancellation', 'refund', 'adjustment')
  ),
  amount INT NOT NULL,
  currency TEXT DEFAULT 'IDR',
  status TEXT DEFAULT 'completed' CHECK (
    status IN ('pending', 'completed', 'failed')
  ),
  description TEXT,
  metadata JSONB, -- Store additional context
  created_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

**Audit Trail:** All financial transactions logged for compliance.

---

### 1.3 Migrations & Setup

**File:** `supabase/migrations/001_initial_schema.sql`

**Steps:**
1. Create tables (in order of dependencies)
2. Create triggers for `updated_at`
3. Create indexes
4. Create views for common queries
5. Create RLS policies (see Phase 2)

**Migration Command:**
```bash
supabase migration new initial_schema
# Edit supabase/migrations/[timestamp]_initial_schema.sql
supabase db push
```

---

### 1.4 Seed Data

**File:** `supabase/seed.sql`

```sql
-- Insert rayons
INSERT INTO shuttle_rayons (id, name, destination, base_price, distance_km)
VALUES
  ('rayon-a', 'RAYON-A', 'Hermes Palace → KNO', 120000, 31),
  ('rayon-b', 'RAYON-B', 'Cambridge → KNO', 130000, 30),
  ('rayon-c', 'RAYON-C', 'Adi Mulia → KNO', 125000, 20),
  ('rayon-d', 'RAYON-D', 'Hotel TD Pardede → KNO', 135000, 30);

-- Insert fare rules
INSERT INTO fare_rules (id, rayon_id, base_fare, per_km_rate, min_charge, ...)
VALUES
  ('shuttle-rayon-a', 'rayon-a', 50000, 2500, 120000, ...),
  -- ... etc
;

-- Insert surge rules
INSERT INTO surge_rules (id, start_time, end_time, days_of_week, multiplier, label)
VALUES
  ('surge-morning', '05:00', '08:30', '{1,2,3,4,5}', 1.3, 'Morning Departure'),
  -- ... etc
;

-- Insert promo codes
INSERT INTO promo_codes (id, code, discount_type, discount_value, min_spend, max_discount, valid_from, valid_until, applicable_modules)
VALUES
  ('promo-shuttle-deals', 'SHUTTLEDEALS', 'percentage', 15, 100000, 30000, '2024-01-01', '2026-12-31', '{shuttle}'),
  -- ... etc
;
```

**Load Data:**
```bash
supabase db push
psql -d [database-url] -f supabase/seed.sql
```

---

## PHASE 2: AUTHENTICATION & SECURITY

### 2.1 Supabase Auth Setup

**Architecture:** Supabase Auth provides JWT-based authentication with email, password, and OAuth2 (Google, GitHub, etc.).

#### Authentication Service

**File:** `src/services/authService.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const AuthService = {
  // Sign up new user
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    
    if (error) throw error;
    return data.user;
  },

  // Sign in with email/password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in with OAuth (Google, GitHub)
  async signInWithOAuth(provider: 'google' | 'github') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Reset password
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw error;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
};
```

**Key Decision:** Single `supabase` client instance for entire app (shared across services).

---

### 2.2 Row-Level Security (RLS) Policies

**Core Principle:** Users can only access their own data. Admins can access all.

#### Policy: Users Can Only View/Update Their Own Profile

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );
```

---

#### Policy: Users Can Only View/Edit Their Own Bookings

```sql
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON bookings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create bookings for themselves
CREATE POLICY "Users can create own bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings (only non-critical fields)
CREATE POLICY "Users can update own pending bookings"
  ON bookings
  FOR UPDATE
  USING (auth.uid() = user_id AND booking_status = 'pending')
  WITH CHECK (auth.uid() = user_id);
```

**Note:** Users cannot update completed bookings (business rule).

---

#### Policy: Public Read for Lookup Tables

```sql
ALTER TABLE shuttle_rayons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view rayons"
  ON shuttle_rayons
  FOR SELECT
  USING (true);

-- Apply same to pickup_points, schedules, fare_rules, promo_codes
```

**Design Note:** Lookup tables (rayons, schedules, etc.) are publicly readable but only admin-writable.

---

### 2.3 Admin Panel RLS

**Create `admin_users` table for role-based access:**

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'moderator')),
  created_at TIMESTAMP DEFAULT now()
);

-- Admins can view all users
CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );
```

---

## PHASE 3: SERVICE LAYER MIGRATION

### 3.1 Service Architecture

**Refactor existing mock services to use Supabase:**

```
Current Structure (Mock):
  src/services/
  ├── fareService.ts (mock API)
  ├── mapService.ts (external APIs)
  └── advancedRouteService.ts (mock traffic)

New Structure (Supabase):
  src/services/
  ├── authService.ts (new)
  ├── fareService.ts (updated)
  ├── shuttleService.ts (new)
  ├── rideService.ts (new)
  ├── hotelService.ts (new)
  ├── bookingService.ts (new)
  ├── promoService.ts (new)
  ├── transactionService.ts (new)
  ├── mapService.ts (unchanged - external APIs)
  └── supabaseClient.ts (new - shared client)
```

---

### 3.2 Shared Supabase Client

**File:** `src/services/supabaseClient.ts`

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export const supabase: SupabaseClient<Database> = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Helper: Get current user
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Helper: Get current session
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
```

**Type Safety:** Generate `database.types.ts` from Supabase dashboard.

---

### 3.3 Updated FareService

**File:** `src/services/fareService.ts` (updated)

**Before:** Mock API with setTimeout  
**After:** Real Supabase queries + in-app FareCalculator

```typescript
import { supabase } from './supabaseClient';
import { FareCalculator } from '@/lib/fareCalculation';
import type { FareCalculationResult } from '@/types/pricing';

export const FareService = {
  /**
   * Calculate shuttle fare using database rules
   * Replaces mock implementation
   */
  async calculateShuttleFare(params: {
    rayonId: string;
    pickupPointId: string;
    serviceTier: string;
    vehicleType: string;
    passengers: Array<{ category: string; count: number }>;
    promoCode?: string;
    isRoundTrip?: boolean;
  }): Promise<FareCalculationResult> {
    try {
      // 1. Fetch fare rule from DB
      const { data: fareRule, error: fareError } = await supabase
        .from('fare_rules')
        .select('*')
        .eq('rayon_id', params.rayonId)
        .eq('is_active', true)
        .single();
      
      if (fareError) throw new Error(`Fare rule not found: ${fareError.message}`);

      // 2. Fetch pickup point for distance
      const { data: pickupPoint, error: pickupError } = await supabase
        .from('shuttle_pickup_points')
        .select('distance_from_airport_meters')
        .eq('id', params.pickupPointId)
        .single();
      
      if (pickupError) throw new Error(`Pickup point not found`);

      // 3. Fetch surge rules for current time
      const { data: surgeRules } = await supabase
        .from('surge_rules')
        .select('*')
        .eq('is_active', true);

      // 4. Fetch promo if provided
      let promo = null;
      if (params.promoCode) {
        const { data: promoData } = await supabase
          .from('promo_codes')
          .select('*')
          .eq('code', params.promoCode)
          .eq('is_active', true)
          .single();
        
        promo = promoData;
      }

      // 5. Calculate using FareCalculator (client-side)
      const distanceKm = pickupPoint.distance_from_airport_meters / 1000;
      
      const result = FareCalculator.calculateFare({
        distance: distanceKm,
        serviceTier: params.serviceTier,
        vehicleType: params.vehicleType,
        passengers: params.passengers,
        rule: fareRule,
        surgeRules: surgeRules || [],
        promoCode: promo,
        isRoundTrip: params.isRoundTrip
      });

      return result;
    } catch (error) {
      console.error('Fare calculation error:', error);
      throw error;
    }
  },

  /**
   * Get quick estimate (base price only)
   */
  async getQuickEstimate(rayonId: string, serviceTier: string): Promise<number> {
    const { data: rayon } = await supabase
      .from('shuttle_rayons')
      .select('base_price')
      .eq('id', rayonId)
      .single();
    
    if (!rayon) throw new Error('Rayon not found');

    const multiplier = {
      'Regular': 1.0,
      'Semi Executive': 1.5,
      'Executive': 2.0
    }[serviceTier] || 1.0;

    return Math.round(rayon.base_price * multiplier);
  }
};
```

**Key Changes:**
- Fetch fare rules from DB instead of mock
- Fetch promo codes from DB
- Still use FareCalculator for deterministic calculations
- RLS ensures only user's own bookings are queried

---

### 3.4 New ShuttleService

**File:** `src/services/shuttleService.ts`

```typescript
import { supabase } from './supabaseClient';

export const ShuttleService = {
  /**
   * Get all rayons
   */
  async getRayons() {
    const { data, error } = await supabase
      .from('shuttle_rayons')
      .select('*')
      .order('created_at');
    
    if (error) throw error;
    return data;
  },

  /**
   * Get pickup points for a rayon
   */
  async getPickupPoints(rayonId: string) {
    const { data, error } = await supabase
      .from('shuttle_pickup_points')
      .select('*')
      .eq('rayon_id', rayonId)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  /**
   * Get schedules for a rayon
   */
  async getSchedules(rayonId: string) {
    const { data, error } = await supabase
      .from('shuttle_schedules')
      .select('*')
      .eq('rayon_id', rayonId)
      .in('status', ['scheduled', 'boarding'])
      .order('departure_time');
    
    if (error) throw error;
    return data;
  },

  /**
   * Subscribe to schedule updates (Realtime)
   */
  subscribeToSchedules(rayonId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`schedules:rayon-${rayonId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shuttle_schedules',
          filter: `rayon_id=eq.${rayonId}`
        },
        callback
      )
      .subscribe();
  }
};
```

**Real-time:** Subscribe to schedule changes for live seat availability.

---

### 3.5 New BookingService

**File:** `src/services/bookingService.ts`

```typescript
import { supabase } from './supabaseClient';
import type { Booking } from '@/types/index';

export const BookingService = {
  /**
   * Create new booking
   */
  async createBooking(bookingData: Omit<Booking, 'id' | 'created_at'>) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          ...bookingData,
          user_id: user.id
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get user's bookings
   */
  async getUserBookings(status?: string) {
    let query = supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('booking_status', status);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  /**
   * Get single booking
   */
  async getBooking(bookingId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        booking_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, reason: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) throw error;

    // Log cancellation transaction
    await supabase.from('transactions').insert([
      {
        user_id: (await supabase.auth.getUser()).data.user!.id,
        booking_id: bookingId,
        transaction_type: 'cancellation',
        amount: -data.total_fare,
        description: `Cancelled: ${reason}`
      }
    ]);

    return data;
  },

  /**
   * Subscribe to booking updates (Realtime)
   */
  subscribeToBooking(bookingId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`booking:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`
        },
        callback
      )
      .subscribe();
  }
};
```

**RLS Protection:** Queries automatically filtered to user's own bookings (via RLS).

---

### 3.6 New PromoService

**File:** `src/services/promoService.ts`

```typescript
import { supabase } from './supabaseClient';

export const PromoService = {
  /**
   * Get all active promos
   */
  async getActivePromos(module?: string) {
    const today = new Date().toISOString().split('T')[0];
    
    let query = supabase
      .from('promo_codes')
      .select('*')
      .eq('is_active', true)
      .gte('valid_until', today)
      .lte('valid_from', today)
      .order('created_at', { ascending: false });
    
    if (module) {
      query = query.contains('applicable_modules', [module]);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  /**
   * Validate promo code
   */
  async validatePromoCode(code: string): Promise<{
    valid: boolean;
    promo?: any;
    error?: string;
  }> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .gte('valid_until', today)
      .lte('valid_from', today)
      .single();
    
    if (error || !data) {
      return { valid: false, error: 'Promo code not found or expired' };
    }

    if (data.max_uses && data.current_uses >= data.max_uses) {
      return { valid: false, error: 'Promo code usage limit exceeded' };
    }

    return { valid: true, promo: data };
  },

  /**
   * Apply promo code (increment uses)
   */
  async applyPromoCode(code: string) {
    const { data, error } = await supabase
      .from('promo_codes')
      .update({ current_uses: supabase.rpc('increment_promo_uses', { code }) })
      .eq('code', code)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

**SQL Function:** `increment_promo_uses` handles atomic increment to prevent race conditions.

```sql
CREATE OR REPLACE FUNCTION increment_promo_uses(code_param TEXT)
RETURNS INT AS $$
DECLARE
  new_uses INT;
BEGIN
  UPDATE promo_codes
  SET current_uses = current_uses + 1
  WHERE code = code_param
  RETURNING current_uses INTO new_uses;
  RETURN new_uses;
END;
$$ LANGUAGE plpgsql;
```

---

## PHASE 4: REAL-TIME FEATURES & TESTING

### 4.1 Real-time Subscriptions

**Update ShuttleContext to use Realtime:**

**File:** `src/context/ShuttleContext.tsx` (updated)

```typescript
import { useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import { ShuttleService } from '@/services/shuttleService';

export function useShuttleBooking() {
  const [selectedRayon, setSelectedRayon] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Subscribe to schedule updates
  useEffect(() => {
    if (!selectedRayon?.id) return;

    const subscription = ShuttleService.subscribeToSchedules(
      selectedRayon.id,
      (payload) => {
        console.log('Schedule update:', payload);
        // Refetch or update state with new data
        if (payload.eventType === 'UPDATE') {
          setSchedules(prev =>
            prev.map(s => s.id === payload.new.id ? payload.new : s)
          );
        }
      }
    );

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedRayon?.id]);

  return { /* ... */ };
}
```

**Real-time Features:**
- Live seat availability updates
- Schedule status changes (delayed → boarding → departed)
- Fare rule changes propagate instantly
- Promo code updates

---

### 4.2 Edge Functions (Optional Advanced)

**For complex calculations not suitable for client-side:**

**File:** `supabase/functions/calculate-fare/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { rayonId, pickupPointId, serviceTier, vehicleType, passengers, promoCode } = await req.json();

  try {
    // Fetch all required data
    const [fareRule, pickupPoint, surgeRules, promo] = await Promise.all([
      supabase.from('fare_rules').select('*').eq('rayon_id', rayonId).single(),
      supabase.from('shuttle_pickup_points').select('*').eq('id', pickupPointId).single(),
      supabase.from('surge_rules').select('*').eq('is_active', true),
      promoCode ? supabase.from('promo_codes').select('*').eq('code', promoCode).single() : null
    ]);

    // Calculate fare (same logic as FareCalculator)
    const distanceKm = pickupPoint.data.distance_from_airport_meters / 1000;
    const baseFare = fareRule.data.base_fare;
    const distanceFare = distanceKm * fareRule.data.per_km_rate;
    // ... calculate total with multipliers

    return new Response(
      JSON.stringify({ totalFare, breakdown }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

**Deploy:**
```bash
supabase functions deploy calculate-fare
```

**Call from Client:**
```typescript
const { data } = await supabase.functions.invoke('calculate-fare', {
  body: { rayonId, pickupPointId, serviceTier, vehicleType, passengers, promoCode }
});
```

**Decision:** Start with client-side FareCalculator; migrate to Edge Functions if performance needs it.

---

### 4.3 Component Integration Example

**File:** `src/pages/ShuttleBooking.tsx` (updated)

```typescript
import { useEffect, useState } from 'react';
import { FareService } from '@/services/fareService';
import { BookingService } from '@/services/bookingService';
import { ShuttleService } from '@/services/shuttleService';

export function ShuttleBooking() {
  const [rayons, setRayons] = useState([]);
  const [selectedRayon, setSelectedRayon] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [fare, setFare] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load rayons on mount
  useEffect(() => {
    async function loadRayons() {
      const data = await ShuttleService.getRayons();
      setRayons(data);
    }
    loadRayons();
  }, []);

  // Load schedules when rayon selected
  useEffect(() => {
    if (!selectedRayon) return;
    
    async function loadSchedules() {
      const data = await ShuttleService.getSchedules(selectedRayon.id);
      setSchedules(data);
    }
    
    loadSchedules();

    // Subscribe to real-time updates
    const channel = ShuttleService.subscribeToSchedules(selectedRayon.id, () => {
      loadSchedules(); // Refetch on changes
    });

    return () => {
      channel.unsubscribe();
    };
  }, [selectedRayon?.id]);

  // Calculate fare when parameters change
  const handleFareRecalculation = async (params) => {
    setIsLoading(true);
    try {
      const result = await FareService.calculateShuttleFare(params);
      setFare(result);
    } catch (error) {
      console.error('Fare calculation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit booking
  const handleSubmitBooking = async (bookingData) => {
    try {
      const booking = await BookingService.createBooking(bookingData);
      
      // Subscribe to booking updates
      BookingService.subscribeToBooking(booking.id, (payload) => {
        console.log('Booking updated:', payload.new);
        // Update UI with live status
      });

      // Navigate to confirmation
      navigate(`/booking/${booking.id}`);
    } catch (error) {
      console.error('Booking creation failed:', error);
    }
  };

  return (
    <div>
      {/* Multi-step wizard using rayons, schedules, fare calculation */}
    </div>
  );
}
```

**Key Points:**
- Real-time schedule updates
- Live fare recalculation
- Booking stored in Supabase
- RLS ensures user isolation

---

### 4.4 Testing Strategy

**Unit Tests:** Business logic, calculations  
**Integration Tests:** Service layer with Supabase  
**E2E Tests:** Full booking flow

**File:** `src/services/__tests__/shuttleService.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ShuttleService } from '@/services/shuttleService';
import { supabase } from '@/services/supabaseClient';

describe('ShuttleService', () => {
  beforeAll(async () => {
    // Setup: ensure test data exists in DB
    await supabase.from('shuttle_rayons').select('*');
  });

  it('should fetch all rayons', async () => {
    const rayons = await ShuttleService.getRayons();
    expect(rayons).toBeDefined();
    expect(rayons.length).toBeGreaterThan(0);
    expect(rayons[0]).toHaveProperty('id');
    expect(rayons[0]).toHaveProperty('name');
  });

  it('should fetch pickup points for a rayon', async () => {
    const pickupPoints = await ShuttleService.getPickupPoints('rayon-a');
    expect(pickupPoints).toBeDefined();
    expect(pickupPoints.length).toBeGreaterThan(0);
  });

  it('should subscribe to schedule updates', (done) => {
    const unsubscribe = ShuttleService.subscribeToSchedules('rayon-a', (payload) => {
      expect(payload).toBeDefined();
      unsubscribe.unsubscribe();
      done();
    });
  });
});
```

---

## DEPLOYMENT & ROLLOUT

### Deployment Strategy

**Phase 1 (Week 1):** Database & Auth  
**Phase 2 (Week 2):** Service Layer  
**Phase 3 (Week 3):** Component Updates  
**Phase 4 (Week 4):** Testing & QA  

### Environment Variables

**File:** `.env.local`

```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
VITE_APP_ENV=development
```

### Checklist Before Production

- [ ] All RLS policies tested
- [ ] Database migrations tested (up & down)
- [ ] Auth flows working (email, OAuth)
- [ ] Real-time subscriptions tested
- [ ] Bookings end-to-end working
- [ ] Payment integration (if using)
- [ ] Error handling & logging
- [ ] Performance testing (load test with k6)
- [ ] Security audit (no N+1 queries, SQL injection prevention)
- [ ] Backup strategy

---

## ESTIMATED EFFORT

| Phase | Tasks | Hours | Notes |
|-------|-------|-------|-------|
| **Phase 1** | Schema design, migrations, seed data | 8-12 | Database design done in this doc |
| **Phase 2** | Auth setup, RLS policies, admin panel | 6-8 | Supabase Auth is quick; RLS requires testing |
| **Phase 3** | Service layer refactoring, integration | 10-14 | 6 new services, updating 3 existing |
| **Phase 4** | Testing, real-time, Edge Functions | 8-10 | Component testing + integration tests |
| **Buffer** | Fixes, documentation, knowledge transfer | 4-6 | ~15% buffer for unknowns |
| **TOTAL** | | **36-50 hours** | ~1 week full-time |

---

## NEXT STEPS

1. **Create Supabase Project** (15 min)
   - Go to supabase.com
   - Create new project
   - Get URL & anon key

2. **Set Up Database Schema** (2-3 hours)
   - Run migrations
   - Load seed data
   - Verify tables & indexes

3. **Implement Phase 2 & 3** (2-3 days)
   - Create service files
   - Integrate with components
   - Test each service

4. **Real-time & Testing** (1-2 days)
   - Add subscriptions
   - Write unit + integration tests
   - Manual E2E testing

5. **Deploy to Production** (1 day)
   - Final security audit
   - Performance optimization
   - Monitor & iterate

---

**Document Status:** ✅ Complete | **Skills Applied:** Senior Backend Engineer (Supabase) + Senior Fullstack Engineer + Postgres Best Practices  
**Last Updated:** April 16, 2026 | **Next Review:** After Phase 1 completion
