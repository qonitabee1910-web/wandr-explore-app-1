# Supabase Integration: Quick Implementation Guide

**Status:** Ready to Execute | **Effort:** 36-50 hours | **Skills:** Backend + Fullstack + PostgreSQL Best Practices

---

## 🚀 QUICK START (30 minutes to first query)

### Step 1: Create Supabase Project
```bash
# Option A: Web Dashboard
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter project name: "wandr-explore-app"
4. Choose region (closest to users)
5. Copy URL and ANON_KEY

# Option B: CLI
npm install -g supabase
supabase login
supabase projects create --name "wandr-explore-app"
```

### Step 2: Install Dependencies
```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-react
npm install --save-dev @supabase/supabase-js-types
```

### Step 3: Setup Environment
```bash
# .env.local
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY_FROM_DASHBOARD]
VITE_APP_ENV=development
```

### Step 4: Create Supabase Client
**File:** `src/services/supabaseClient.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Step 5: Generate TypeScript Types
```bash
# Install Supabase CLI
npm install -D supabase

# Generate types from your database
supabase gen types typescript --project-id [PROJECT_ID] --schema public > src/types/database.types.ts
```

### Step 6: Test Connection
```typescript
// src/services/__tests__/supabaseClient.test.ts
import { supabase } from '@/services/supabaseClient';

async function testConnection() {
  const { data, error } = await supabase
    .from('shuttle_rayons')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('✅ Connected to Supabase:', data);
  }
}

testConnection();
```

---

## 📋 PHASE-BY-PHASE IMPLEMENTATION

### PHASE 1: Database Setup (3-4 hours)

#### 1.1 Create Migration File
```bash
supabase migration new initial_schema
```

#### 1.2 Copy Schema (to `supabase/migrations/[timestamp]_initial_schema.sql`)
See [SUPABASE_INTEGRATION_PLAN.md](./SUPABASE_INTEGRATION_PLAN.md#phase-1-database-setup) for complete SQL.

#### 1.3 Run Migrations
```bash
supabase db push
```

#### 1.4 Verify in Supabase Dashboard
- Go to SQL Editor
- Check each table exists
- Verify indexes created

#### 1.5 Seed Data
```bash
# Create seed file
supabase migration new seed_data

# Add INSERT statements (see plan doc)
supabase db push
```

#### ✅ Success Criteria
- [ ] All 11 tables created
- [ ] All indexes visible in dashboard
- [ ] Seed data loaded (rayons, schedules, fare rules)
- [ ] Foreign key constraints active

---

### PHASE 2: Authentication (2-3 hours)

#### 2.1 Enable Email Auth
- Supabase Dashboard → Authentication → Providers
- Enable: Email/Password
- Set up email templates (optional)

#### 2.2 Create Auth Service
**File:** `src/services/authService.ts`

```typescript
import { supabase } from './supabaseClient';

export const AuthService = {
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

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
};
```

#### 2.3 Create Auth Context
**File:** `src/context/AuthContext.tsx`

```typescript
import React, { createContext, useEffect, useState } from 'react';
import { AuthService } from '@/services/authService';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange((authUser) => {
      setUser(authUser);
      setIsLoading(false);
    });

    return () => unsubscribe?.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    await AuthService.signUp(email, password, fullName);
  };

  const signIn = async (email: string, password: string) => {
    await AuthService.signIn(email, password);
  };

  const signOut = async () => {
    await AuthService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### 2.4 Update App.tsx
```typescript
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* rest of app */}
    </AuthProvider>
  );
}
```

#### 2.5 Update Account Page
```typescript
import { useAuth } from '@/context/AuthContext';

export function AccountPage() {
  const { user, signIn, signUp, signOut } = useAuth();

  if (!user) {
    return <LoginForm onSignIn={signIn} onSignUp={signUp} />;
  }

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

#### ✅ Success Criteria
- [ ] Auth service methods work
- [ ] Auth context provides user state
- [ ] Login/signup flow works
- [ ] Logout works
- [ ] Session persists on page reload

---

### PHASE 3: Service Layer Migration (4-5 hours per service)

#### Template: Migrate Any Service

**Before (Mock):**
```typescript
// src/services/fareService.ts (OLD)
export const FareService = {
  async calculateShuttleFare(params) {
    await new Promise(resolve => setTimeout(resolve, 300)); // MOCK DELAY
    
    // Return hardcoded result
    return { totalFare: 150000, breakdown: {...} };
  }
};
```

**After (Supabase):**
```typescript
// src/services/fareService.ts (NEW)
import { supabase } from './supabaseClient';

export const FareService = {
  async calculateShuttleFare(params) {
    // 1. Fetch data from DB
    const { data: fareRule } = await supabase
      .from('fare_rules')
      .select('*')
      .eq('rayon_id', params.rayonId)
      .single();

    // 2. Use existing FareCalculator
    const result = FareCalculator.calculateFare({
      ...params,
      rule: fareRule
    });

    return result;
  }
};
```

#### 3.1 Create ShuttleService
**File:** `src/services/shuttleService.ts`

```typescript
import { supabase } from './supabaseClient';

export const ShuttleService = {
  async getRayons() {
    const { data, error } = await supabase
      .from('shuttle_rayons')
      .select('*')
      .order('created_at');
    if (error) throw error;
    return data;
  },

  async getPickupPoints(rayonId: string) {
    const { data, error } = await supabase
      .from('shuttle_pickup_points')
      .select('*')
      .eq('rayon_id', rayonId);
    if (error) throw error;
    return data;
  },

  async getSchedules(rayonId: string) {
    const { data, error } = await supabase
      .from('shuttle_schedules')
      .select('*')
      .eq('rayon_id', rayonId)
      .in('status', ['scheduled', 'boarding']);
    if (error) throw error;
    return data;
  },

  subscribeToSchedules(rayonId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`schedules:${rayonId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'shuttle_schedules',
        filter: `rayon_id=eq.${rayonId}`
      }, callback)
      .subscribe();
  }
};
```

#### 3.2 Create BookingService
**File:** `src/services/bookingService.ts`

```typescript
import { supabase } from './supabaseClient';

export const BookingService = {
  async createBooking(bookingData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .insert([{ ...bookingData, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserBookings(status?: string) {
    let query = supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) query = query.eq('booking_status', status);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getBooking(bookingId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateBookingStatus(bookingId: string, status: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ booking_status: status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  subscribeToBooking(bookingId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`booking:${bookingId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`
      }, callback)
      .subscribe();
  }
};
```

#### 3.3 Create PromoService
**File:** `src/services/promoService.ts`

```typescript
import { supabase } from './supabaseClient';

export const PromoService = {
  async getActivePromos(module?: string) {
    const today = new Date().toISOString().split('T')[0];
    
    let query = supabase
      .from('promo_codes')
      .select('*')
      .eq('is_active', true)
      .gte('valid_until', today)
      .lte('valid_from', today);
    
    if (module) {
      query = query.contains('applicable_modules', [module]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async validatePromoCode(code: string) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .gte('valid_until', today)
      .lte('valid_from', today)
      .single();
    
    if (error) return { valid: false, error: 'Promo code not found' };
    if (data.max_uses && data.current_uses >= data.max_uses) {
      return { valid: false, error: 'Usage limit exceeded' };
    }
    return { valid: true, promo: data };
  }
};
```

#### ✅ Success Criteria Per Service
- [ ] Service methods fetch from DB (not mock)
- [ ] RLS prevents unauthorized access
- [ ] Error handling in place
- [ ] Real-time subscriptions working
- [ ] Integration tests passing

---

### PHASE 4: Component Updates (3-4 hours per page)

#### Example: Update ShuttleBooking Component
```typescript
// src/pages/ShuttleBooking.tsx (UPDATED)
import { useEffect, useState } from 'react';
import { ShuttleService } from '@/services/shuttleService';
import { BookingService } from '@/services/bookingService';
import { FareService } from '@/services/fareService';

export function ShuttleBooking() {
  const [rayons, setRayons] = useState([]);
  const [selectedRayon, setSelectedRayon] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [fare, setFare] = useState(null);

  // Load rayons on mount
  useEffect(() => {
    async function load() {
      const data = await ShuttleService.getRayons();
      setRayons(data);
    }
    load();
  }, []);

  // Load schedules when rayon changes + subscribe to updates
  useEffect(() => {
    if (!selectedRayon) return;

    async function load() {
      const data = await ShuttleService.getSchedules(selectedRayon.id);
      setSchedules(data);
    }

    load();

    // Subscribe to real-time updates
    const channel = ShuttleService.subscribeToSchedules(selectedRayon.id, () => {
      load(); // Refetch on changes
    });

    return () => channel.unsubscribe();
  }, [selectedRayon?.id]);

  const handleCalculateFare = async (params) => {
    const result = await FareService.calculateShuttleFare(params);
    setFare(result);
  };

  const handleSubmitBooking = async (bookingData) => {
    const booking = await BookingService.createBooking(bookingData);
    
    // Subscribe to booking updates
    BookingService.subscribeToBooking(booking.id, (payload) => {
      console.log('Booking status changed:', payload.new);
    });

    navigate(`/booking/${booking.id}`);
  };

  return (
    <div>
      {/* Render UI with rayons, schedules, fare */}
    </div>
  );
}
```

---

## 🧪 TESTING CHECKLIST

### Unit Tests (Per Service)
```typescript
describe('ShuttleService', () => {
  it('should fetch rayons from DB', async () => {
    const rayons = await ShuttleService.getRayons();
    expect(rayons).toBeDefined();
    expect(rayons.length).toBeGreaterThan(0);
  });

  it('should fetch pickup points for rayon', async () => {
    const points = await ShuttleService.getPickupPoints('rayon-a');
    expect(points.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests (Service + DB)
```typescript
describe('BookingService + Database', () => {
  it('should create booking and retrieve it', async () => {
    const booking = await BookingService.createBooking({
      booking_type: 'shuttle',
      shuttle_schedule_id: 'test-schedule',
      // ... other fields
    });

    expect(booking.id).toBeDefined();

    const retrieved = await BookingService.getBooking(booking.id);
    expect(retrieved.id).toBe(booking.id);
  });
});
```

### E2E Tests (Full Flow)
```typescript
describe('Shuttle Booking Flow', () => {
  it('should complete full booking', async () => {
    // 1. Sign up
    // 2. Select rayon → schedule → pickup → service → vehicle → seats
    // 3. Calculate fare
    // 4. Apply promo
    // 5. Create booking
    // 6. Verify in DB
    // 7. Subscribe to updates
    // 8. Verify real-time updates work
  });
});
```

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: "RLS policy blocks query"
**Solution:** Check that user is authenticated and RLS allows the operation.
```typescript
// Verify auth
const { data: user } = await supabase.auth.getUser();
console.log('Current user:', user?.id);

// Check RLS: SELECT from public table should work
const { data, error } = await supabase
  .from('shuttle_rayons')
  .select('*')
  .limit(1);

if (error) console.error('RLS Error:', error.message);
```

### Issue: "Types not found" (database.types.ts missing)
**Solution:** Generate types from Supabase CLI.
```bash
supabase gen types typescript --project-id [ID] > src/types/database.types.ts
```

### Issue: "Real-time subscription not working"
**Solution:** Verify Realtime is enabled in Supabase dashboard.
- Go to Settings → Replication
- Check tables have Realtime enabled
- Verify WebSocket connection in browser DevTools

### Issue: "Seat conflicts" in concurrent bookings
**Solution:** Use database transactions to prevent race conditions.
```typescript
// Use Postgres function with transaction
const { data, error } = await supabase.rpc('book_seats', {
  schedule_id: scheduleId,
  seat_ids: selectedSeats
});
```

---

## 📊 SUCCESS METRICS

### Database
- ✅ All 11 tables created with correct relationships
- ✅ All indexes exist and query plans show index usage
- ✅ RLS policies prevent unauthorized access
- ✅ Seed data loads without conflicts

### Authentication
- ✅ Email/password signup works
- ✅ Login returns valid JWT
- ✅ Logout clears session
- ✅ Protected routes require auth

### Services
- ✅ ShuttleService fetches real rayon data
- ✅ BookingService creates bookings in DB
- ✅ FareService calculates from DB rules
- ✅ PromoService validates codes

### Real-time
- ✅ Schedule updates broadcast to subscribers
- ✅ Booking status changes update UI
- ✅ Fare recalculations trigger in real-time
- ✅ No duplicate messages received

### Performance
- ✅ Queries execute < 200ms
- ✅ Indexes used for WHERE clauses
- ✅ N+1 queries eliminated
- ✅ Connection pooling active

---

## 📞 NEED HELP?

**Supabase Docs:** https://supabase.com/docs  
**Discord:** https://discord.supabase.com  
**GitHub Issues:** https://github.com/supabase/supabase/issues  
**This Project Docs:** See [SUPABASE_INTEGRATION_PLAN.md](./SUPABASE_INTEGRATION_PLAN.md)

---

**Status:** ✅ Ready to implement | **Last Updated:** April 16, 2026
