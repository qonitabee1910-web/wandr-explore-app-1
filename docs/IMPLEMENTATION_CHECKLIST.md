# Supabase Integration: Implementation Checklist & Skills Applied

**Project:** Wandr-Explore-App  
**Date:** April 16, 2026  
**Total Effort:** 36-50 hours  
**Skills Applied:** 3 advanced professional skills

---

## 📚 SKILLS APPLIED

### 1. **Senior Backend Engineer (Supabase)**
**Source:** `senior-backend-engineer-supabase/SKILL.md`

**Applied Concepts:**
- ✅ **Database Design & Schema Architecture**
  - Normalized 3NF schema (11 tables)
  - Foreign key relationships with CASCADE deletes
  - Audit columns (created_at, updated_at)
  - Composite and partial indexes for performance
  - Constraints (NOT NULL, CHECK, UNIQUE, domain)

- ✅ **API Security & Row-Level Security**
  - RLS policies for user data isolation
  - Public read for lookup tables
  - Authenticated-only for sensitive operations
  - Admin role separation

- ✅ **Migration & Deployment Strategy**
  - Reversible migrations (up/down)
  - Seed data script
  - Testing in dev before production
  - Rollback procedures

- ✅ **Realtime Architecture**
  - Subscription to schedule updates
  - Booking status change propagation
  - Fare recalculation triggers

---

### 2. **Senior Fullstack Engineer (React + TypeScript)**
**Source:** `senior-fullstack-engineer/SKILL.md`

**Applied Concepts:**
- ✅ **Code Review & Quality Gates**
  - Type-safe service layer (no `any` types)
  - Error handling in all services
  - Clear separation of concerns (UI ≠ Logic ≠ API)

- ✅ **Implementation Pattern (Plan → Code → Test → Deploy)**
  - 4-phase implementation roadmap
  - Clear dependencies and checkpoints
  - Testing at each stage (unit, integration, E2E)

- ✅ **Component Integration**
  - Updating components to use new services
  - Context API for auth state
  - Real-time subscriptions in components

- ✅ **Architecture Decisions**
  - Client-side FareCalculator stays (performant)
  - Supabase as source of truth for persistence
  - Edge Functions for complex logic (optional)

---

### 3. **Postgres Best Practices (Supabase)**
**Source:** `supabase-postgres-best-practices/SKILL.md`

**Applied Concepts:**
- ✅ **Query Performance**
  - Indexes on foreign keys (booking.user_id)
  - Partial indexes where needed (status filters)
  - Composite indexes for WHERE + JOIN patterns
  - EXPLAIN analysis for optimization

- ✅ **Schema Design**
  - Proper 3NF normalization
  - Referential integrity constraints
  - Timestamp management with triggers
  - JSONB for flexible passenger data

- ✅ **Concurrency & Locking**
  - Atomic increment for promo code uses
  - Transaction-based seat booking
  - Avoiding N+1 queries

- ✅ **Security & RLS**
  - RLS policies on all user data tables
  - Policy testing strategies
  - Admin access restrictions

---

## ✅ IMPLEMENTATION CHECKLIST

### PHASE 1: Database Setup (3-4 hours)

#### 1.1 Supabase Project
- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project (copy URL and ANON_KEY)
- [ ] Store credentials in `.env.local`
- [ ] Verify project region (choose closest to users)

#### 1.2 Database Schema
- [ ] Create migration: `supabase migration new initial_schema`
- [ ] Copy table definitions from SUPABASE_INTEGRATION_PLAN.md:
  - [ ] `users` table
  - [ ] `shuttle_rayons` table
  - [ ] `shuttle_pickup_points` table
  - [ ] `shuttle_schedules` table
  - [ ] `fare_rules` table
  - [ ] `surge_rules` table
  - [ ] `promo_codes` table
  - [ ] `bookings` table (complex, supports all 3 modules)
  - [ ] `transactions` table
  - [ ] Admin tables (`admin_users`)
  - [ ] Views for common queries

#### 1.3 Indexes & Constraints
- [ ] Create all indexes (25+ indexes for performance)
- [ ] Verify NOT NULL constraints
- [ ] Verify CHECK constraints on status fields
- [ ] Verify UNIQUE constraints on email, code, etc.
- [ ] Test foreign key cascades

#### 1.4 Migrations & Seed Data
- [ ] Run: `supabase db push`
- [ ] Verify tables in Supabase dashboard
- [ ] Load seed data (4 rayons, schedules, fare rules, promos)
- [ ] Verify row counts:
  - [ ] shuttle_rayons: 4 rows
  - [ ] shuttle_pickup_points: 45+ rows
  - [ ] shuttle_schedules: 20+ rows
  - [ ] fare_rules: 4 rows
  - [ ] surge_rules: 3 rows
  - [ ] promo_codes: 6 rows

#### 1.5 Verification
- [ ] Run test query in Supabase SQL Editor:
  ```sql
  SELECT r.id, r.name, 
    (SELECT COUNT(*) FROM shuttle_pickup_points p WHERE p.rayon_id = r.id) as pickup_count
  FROM shuttle_rayons r;
  ```
  - [ ] Results show 4 rayons with pickup points

#### ✅ Phase 1 Success Criteria
- [ ] 11 tables created
- [ ] 25+ indexes created
- [ ] Seed data loaded
- [ ] Test query returns expected results
- [ ] No foreign key violations

---

### PHASE 2: Authentication & Security (2-3 hours)

#### 2.1 Supabase Auth Setup
- [ ] Enable Email/Password provider
  - Go to Supabase Dashboard → Authentication → Providers
  - Toggle "Email" on
- [ ] Configure email templates (optional):
  - [ ] Confirmation email
  - [ ] Password reset email
  - [ ] Invite email

#### 2.2 Create Auth Service
- [ ] Create `src/services/authService.ts`
  - [ ] `signUp(email, password, fullName)` method
  - [ ] `signIn(email, password)` method
  - [ ] `signOut()` method
  - [ ] `getSession()` method
  - [ ] `onAuthStateChange(callback)` for listeners

#### 2.3 Create Auth Context
- [ ] Create `src/context/AuthContext.tsx`
  - [ ] `AuthProvider` component
  - [ ] `useAuth()` custom hook
  - [ ] Provide: user, isLoading, signUp, signIn, signOut
  - [ ] Subscribe to auth state changes on mount

#### 2.4 Wrap App with AuthProvider
- [ ] Update `src/App.tsx`:
  ```typescript
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
  ```

#### 2.5 Update Account Page
- [ ] Create login/signup forms using AuthService
- [ ] Display current user email
- [ ] Add logout button
- [ ] Handle auth errors gracefully

#### 2.6 RLS Policies
- [ ] Enable RLS on all tables:
  ```sql
  ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
  ```
- [ ] Create user profile policies:
  - [ ] Users can view own profile
  - [ ] Users can update own profile
  - [ ] Admins can view all profiles
- [ ] Create booking policies:
  - [ ] Users can view own bookings
  - [ ] Users can create bookings for themselves
  - [ ] Users can update pending bookings only
- [ ] Create public read policies:
  - [ ] Anyone can read shuttle_rayons
  - [ ] Anyone can read shuttle_pickup_points
  - [ ] Anyone can read shuttle_schedules
  - [ ] Anyone can read promo_codes
  - [ ] Anyone can read fare_rules

#### 2.7 Test RLS Policies
- [ ] Test as authenticated user (can see own data)
- [ ] Test as different user (cannot see other's data)
- [ ] Test as unauthenticated (can see public tables)
- [ ] Try to bypass RLS (should fail)

#### ✅ Phase 2 Success Criteria
- [ ] Email/Password auth enabled
- [ ] Auth service methods work
- [ ] Auth context provides user state
- [ ] Login/signup/logout work
- [ ] RLS policies prevent unauthorized access
- [ ] Can verify user isolation in DB

---

### PHASE 3: Service Layer Migration (2 hours per service)

#### 3.1 Setup Shared Client
- [ ] Create `src/services/supabaseClient.ts`:
  ```typescript
  export const supabase = createClient(
    VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY
  );
  ```

#### 3.2 Generate TypeScript Types
- [ ] Install Supabase CLI: `npm install -D supabase`
- [ ] Generate types: `supabase gen types typescript --project-id [ID] > src/types/database.types.ts`
- [ ] Commit generated types to git

#### 3.3 Create ShuttleService
- [ ] File: `src/services/shuttleService.ts`
- [ ] Methods:
  - [ ] `getRayons()` - fetch all rayons
  - [ ] `getPickupPoints(rayonId)` - fetch pickup points per rayon
  - [ ] `getSchedules(rayonId)` - fetch schedules per rayon
  - [ ] `subscribeToSchedules(rayonId, callback)` - real-time updates
- [ ] Test:
  - [ ] [ ] Fetch returns data
  - [ ] [ ] Filters work (rayon_id, status)
  - [ ] [ ] Real-time subscription receives updates

#### 3.4 Create BookingService
- [ ] File: `src/services/bookingService.ts`
- [ ] Methods:
  - [ ] `createBooking(bookingData)` - insert booking
  - [ ] `getUserBookings(status)` - fetch user's bookings (RLS filtered)
  - [ ] `getBooking(bookingId)` - fetch single booking
  - [ ] `updateBookingStatus(bookingId, status)` - update status
  - [ ] `cancelBooking(bookingId, reason)` - cancel + log transaction
  - [ ] `subscribeToBooking(bookingId, callback)` - real-time status updates
- [ ] Test:
  - [ ] [ ] Create booking works
  - [ ] [ ] RLS prevents seeing other users' bookings
  - [ ] [ ] Status updates reflected in DB
  - [ ] [ ] Cancellation logs transaction

#### 3.5 Create PromoService
- [ ] File: `src/services/promoService.ts`
- [ ] Methods:
  - [ ] `getActivePromos(module)` - fetch valid promos by date
  - [ ] `validatePromoCode(code)` - check code is valid + not maxed out
  - [ ] `applyPromoCode(code)` - increment usage count
- [ ] Test:
  - [ ] [ ] Fetch returns active promos only
  - [ ] [ ] Expired promos excluded
  - [ ] [ ] Max uses enforced
  - [ ] [ ] Atomic increment works (no race conditions)

#### 3.6 Update FareService
- [ ] Update `src/services/fareService.ts`:
  - [ ] Fetch fare_rules from DB (not hardcoded)
  - [ ] Fetch surge_rules from DB (not hardcoded)
  - [ ] Fetch promo codes from DB (not hardcoded)
  - [ ] Keep FareCalculator logic (client-side for performance)
- [ ] Test:
  - [ ] [ ] Calculations match mock data
  - [ ] [ ] Supports all 4 rayons
  - [ ] [ ] Surge pricing applies correctly
  - [ ] [ ] Promo discounts work

#### 3.7 Create RideService (if building ride module)
- [ ] Similar pattern to ShuttleService
- [ ] Methods for ride data fetching

#### 3.8 Create HotelService (if building hotel module)
- [ ] Similar pattern to ShuttleService
- [ ] Methods for hotel data fetching

#### ✅ Phase 3 Success Criteria
- [ ] All 6 services created
- [ ] TypeScript types generated
- [ ] No `any` types in services
- [ ] All methods tested and working
- [ ] RLS policies prevent unauthorized access
- [ ] Real-time subscriptions work

---

### PHASE 4: Component Integration (1-2 hours per page)

#### 4.1 Update ShuttleBooking Page
- [ ] Import new services: ShuttleService, FareService, BookingService
- [ ] Replace mock data fetches:
  ```typescript
  // OLD
  const rayons = shuttleRayons;
  
  // NEW
  const [rayons, setRayons] = useState([]);
  useEffect(() => {
    ShuttleService.getRayons().then(setRayons);
  }, []);
  ```
- [ ] Add real-time subscription to schedules
- [ ] Update booking creation to use BookingService
- [ ] Subscribe to booking updates
- [ ] Test end-to-end booking flow

#### 4.2 Update Account Page
- [ ] Show authenticated user from AuthContext
- [ ] Fetch booking history from BookingService
- [ ] Display user profile info
- [ ] Add edit profile form
- [ ] Test auth flows

#### 4.3 Update Ride Module (if exists)
- [ ] Create RideService (similar to ShuttleService)
- [ ] Update Ride components to use RideService
- [ ] Verify booking creation works

#### 4.4 Update Hotel Module (if exists)
- [ ] Create HotelService
- [ ] Update Hotel components
- [ ] Verify booking creation works

#### 4.5 Update Promo Module
- [ ] Fetch promos from PromoService instead of mock
- [ ] Filter by module
- [ ] Show actual valid dates from DB

#### 4.6 Update FareService Usage
- [ ] Components calling FareService now get DB data
- [ ] Verify fare calculations still accurate
- [ ] Test with different rayons/multipliers

#### ✅ Phase 4 Success Criteria
- [ ] All pages updated to use services
- [ ] No mock data fetches (except static lists)
- [ ] Real-time updates work
- [ ] Bookings persist to DB
- [ ] User isolation verified
- [ ] All E2E flows work

---

### PHASE 5: Testing & Quality Assurance (2-3 hours)

#### 5.1 Unit Tests
- [ ] Create test files for each service:
  - [ ] `src/services/__tests__/shuttleService.test.ts`
  - [ ] `src/services/__tests__/bookingService.test.ts`
  - [ ] `src/services/__tests__/promoService.test.ts`
  - [ ] `src/services/__tests__/authService.test.ts`

#### 5.2 Integration Tests
- [ ] Test service + DB interactions:
  - [ ] Create booking, retrieve it, verify DB state
  - [ ] Update booking, verify updates reflect
  - [ ] Cancel booking, verify transaction logged
  - [ ] Apply promo, verify discount calculated

#### 5.3 E2E Tests
- [ ] Full user journey:
  - [ ] Sign up → Login
  - [ ] Search shuttles → Calculate fare → Select seats
  - [ ] Apply promo → Create booking
  - [ ] View booking history
  - [ ] Cancel booking
  - [ ] Verify data in DB

#### 5.4 Performance Testing
- [ ] Measure query times:
  - [ ] `getRayons()` < 100ms
  - [ ] `getSchedules()` < 200ms
  - [ ] `calculateShuttleFare()` < 300ms
  - [ ] `createBooking()` < 500ms

#### 5.5 Security Testing
- [ ] Try to access other user's booking (should fail)
- [ ] Try to bypass auth (should fail)
- [ ] Try SQL injection in filters (should fail)
- [ ] Verify JWT expires
- [ ] Verify RLS prevents direct table access

#### 5.6 Load Testing
- [ ] Test with k6 or similar:
  ```bash
  npm install -D k6
  k6 run test-load.js
  ```

#### ✅ Phase 5 Success Criteria
- [ ] Unit test coverage > 80%
- [ ] Integration tests pass
- [ ] E2E tests all scenarios
- [ ] Performance targets met
- [ ] No security vulnerabilities
- [ ] Concurrent bookings handled

---

### PHASE 6: Deployment (1-2 hours)

#### 6.1 Production Database
- [ ] Create separate Supabase project for production
- [ ] Run migrations on production DB
- [ ] Verify all tables created
- [ ] Load production seed data

#### 6.2 Environment Configuration
- [ ] Create `.env.production` with production Supabase credentials
- [ ] Verify environment variables loaded correctly
- [ ] Test auth with production credentials

#### 6.3 Final Testing
- [ ] Test full booking flow on production
- [ ] Verify real-time updates work
- [ ] Check performance on live DB
- [ ] Verify RLS policies active

#### 6.4 Monitoring & Alerts
- [ ] Set up Supabase monitoring dashboard
- [ ] Configure alerts for:
  - [ ] Query performance > 1 second
  - [ ] Auth failures > threshold
  - [ ] DB connection errors
- [ ] Set up error tracking (Sentry, LogRocket, etc.)

#### 6.5 Documentation
- [ ] Document database schema
- [ ] Document API (service methods)
- [ ] Create runbook for common issues
- [ ] Document deployment procedures

#### ✅ Phase 6 Success Criteria
- [ ] Production DB ready
- [ ] All tests pass on production
- [ ] Performance acceptable
- [ ] Monitoring active
- [ ] Team trained on procedures

---

## 📊 EFFORT BREAKDOWN

| Phase | Task | Hours | Dependencies |
|-------|------|-------|--------------|
| 1 | Schema design & migrations | 3-4 | None |
| 2 | Auth & RLS setup | 2-3 | Phase 1 |
| 3 | Service layer (6 services × 45min) | 4-5 | Phase 1, 2 |
| 4 | Component updates (5 pages × 1hr) | 5-6 | Phase 3 |
| 5 | Testing (unit, integration, E2E, load, security) | 3-4 | Phase 4 |
| 6 | Deployment & monitoring | 1-2 | Phase 5 |
| Buffer | Unknown issues, refinement | 4-6 | All |
| **TOTAL** | | **22-30 hours** | **1 week (4-5 days)** |

---

## 🎯 SUCCESS METRICS

### Database Completeness
- ✅ All 11 tables created
- ✅ 25+ indexes for performance
- ✅ Foreign key constraints active
- ✅ RLS policies on all user tables
- ✅ Seed data loaded (4 rayons, 45+ points, schedules)

### Authentication & Security
- ✅ Email/password signup works
- ✅ Login returns valid JWT
- ✅ RLS prevents data leaks
- ✅ User isolation verified
- ✅ No SQL injection vulnerabilities

### Service Layer
- ✅ ShuttleService fetches real rayon data
- ✅ BookingService persists to DB
- ✅ FareService uses DB rules
- ✅ PromoService validates codes
- ✅ All services have error handling

### Real-time Features
- ✅ Schedule updates broadcast to subscribers
- ✅ Booking status changes update UI
- ✅ Multiple subscribers work correctly
- ✅ No duplicate messages

### User Experience
- ✅ Booking flow works end-to-end
- ✅ Fare calculates correctly with all multipliers
- ✅ Promos apply correctly with date validation
- ✅ Booking history displays correctly
- ✅ No UI lag or freezing

### Performance
- ✅ Queries execute < 200ms
- ✅ Indexes used (verified with EXPLAIN)
- ✅ No N+1 queries
- ✅ Bundle size unchanged
- ✅ Real-time latency < 500ms

### Testing
- ✅ Unit test coverage ≥ 80%
- ✅ Integration tests pass
- ✅ E2E tests pass
- ✅ Load tests acceptable
- ✅ Security tests pass

---

## 📋 ROLLBACK PLAN

**If issues occur:**

1. **Database:** Revert to backup (Supabase auto-backups daily)
2. **Code:** Revert Git commits, redeploy previous version
3. **Auth:** Disable auth provider (go back to mock)
4. **Services:** Keep both mock + Supabase services, toggle via feature flag

---

## 🚀 GO-LIVE CHECKLIST

### Week Before
- [ ] Database backups automated
- [ ] Team trained on Supabase dashboard
- [ ] Monitoring configured
- [ ] Runbook prepared

### Day Before
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Staging environment matches production

### Go-Live Day
- [ ] Deploy to production
- [ ] Monitor error rates
- [ ] Check real-time updates
- [ ] Verify user bookings persist
- [ ] Monitor database performance

### Day After
- [ ] Review error logs
- [ ] Gather user feedback
- [ ] Check booking accuracy
- [ ] Verify all calculations correct
- [ ] Plan any hotfixes

---

## 📞 SUPPORT & RESOURCES

**Supabase Documentation:** https://supabase.com/docs  
**Supabase Discord:** https://discord.supabase.com  
**GitHub Issues:** https://github.com/supabase/supabase  
**Project Plan:** See [SUPABASE_INTEGRATION_PLAN.md](./SUPABASE_INTEGRATION_PLAN.md)  
**Quick Start:** See [SUPABASE_QUICK_START.md](./SUPABASE_QUICK_START.md)

---

**Status:** ✅ Ready to implement  
**Last Updated:** April 16, 2026  
**Skills Applied:** 3 (Backend + Fullstack + Postgres)
