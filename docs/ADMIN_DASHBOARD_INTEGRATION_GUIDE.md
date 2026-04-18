# 🎛️ Admin Dashboard Integration Guide

## Overview

The PYU-GO Admin Dashboard is a comprehensive management system for administering all platform operations. It provides complete Supabase integration with real-time data management capabilities.

**Status:** ✅ 80% Complete - Services Integrated, Pages Need Enhancement  
**Architecture:** Service Layer + React Hooks + Supabase  
**Authentication:** Supabase Auth (Admin Role Required)

---

## 📋 Admin Dashboard Structure

```
src/admin/
├── AdminRouter.tsx           # Main router with all routes
├── components/
│   ├── AdminLayout.tsx       # Main layout wrapper
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── Topbar.tsx            # Top header bar
│   └── *.css                 # Component styles
├── pages/                    # 8 main pages
│   ├── Dashboard.tsx         # Analytics & metrics
│   ├── Drivers.tsx           # Driver management
│   ├── Rides.tsx             # Ride monitoring
│   ├── Shuttles.tsx          # Shuttle management
│   ├── Pricing.tsx           # Pricing control
│   ├── Promos.tsx            # Promo management
│   ├── Ads.tsx               # Ad management
│   └── Settings.tsx          # Settings & config
├── services/                 # 8 Supabase services
│   ├── dashboardService.ts
│   ├── driverService.ts
│   ├── rideService.ts
│   ├── shuttleService.ts
│   ├── pricingService.ts
│   ├── promoService.ts
│   ├── adsService.ts
│   ├── settingsService.ts
│   └── supabaseClient.ts     # Supabase config
├── types/                    # TypeScript definitions
├── hooks/                    # ⚠️ EMPTY - Custom hooks here
├── context/                  # ⚠️ EMPTY - Global state here
└── migrations/               # Database migrations

```

---

## 🔧 Admin Services Overview

All admin services follow a **consistent pattern** for reliability and maintainability.

### 1. Dashboard Service

**Purpose:** Analytics, metrics, and dashboard statistics

**Key Methods:**
```typescript
// Get dashboard statistics
await dashboardService.getStats()
  ↓ Returns: DashboardStats (total rides, drivers, revenue, etc.)

// Get analytics data (last N days)
await dashboardService.getAnalyticsData(days: 7)
  ↓ Returns: AnalyticsData[] (daily metrics)

// Subscribe to real-time stats
dashboardService.subscribeToStats((stats) => { /* updates */ })
  ↓ Real-time: Automatic updates on data changes
```

**Current Implementation:** ✅ Complete with Supabase queries  
**Used By:** Dashboard page

---

### 2. Driver Service

**Purpose:** Approve, manage, and monitor drivers

**Key Methods:**
```typescript
// Get drivers with filters & pagination
await driverService.getDrivers({
  search?: string,
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'suspended',
  vehicleType?: 'ride' | 'shuttle',
  rating?: number,
  page: 1,
  limit: 20,
  sortBy?: 'created_at' | 'rating',
  sortOrder?: 'asc' | 'desc'
})

// Get single driver details
await driverService.getDriver(driverId: string)

// Approve or reject driver
await driverService.approveDriver({
  driver_id: string,
  approved: boolean,
  rejection_reason?: string,
  approval_notes?: string
})

// Update driver status
await driverService.updateDriverStatus(
  driverId: string,
  status: 'suspended' | 'approved' | 'inactive'
)

// Suspend driver
await driverService.suspendDriver(driverId: string, reason: string)
```

**Current Implementation:** ✅ Complete  
**Used By:** Drivers page

---

### 3. Ride Service

**Purpose:** Monitor, track, and manage rides

**Key Methods:**
```typescript
// Get rides with filters & pagination
await rideService.getRides({
  search?: string,
  status?: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'canceled',
  rideType?: 'regular' | 'shared',
  minFare?: number,
  maxFare?: number,
  startDate?: string,
  endDate?: string,
  page: 1,
  limit: 20
})

// Get single ride details
await rideService.getRide(rideId: string)

// Get ride tracking
await rideService.getRideTracking(rideId: string)

// Get ride metrics
await rideService.getRideMetrics(period: 'daily' | 'weekly' | 'monthly')

// Cancel ride (admin action)
await rideService.cancelRide(rideId: string, reason: string)
```

**Current Implementation:** ✅ Complete  
**Used By:** Rides page

---

### 4. Shuttle Service

**Purpose:** Manage shuttle operators, routes, and schedules

**Key Methods:**
```typescript
// Get all shuttles
await shuttleService.getShuttles(page: 1, limit: 20)

// Create new shuttle
await shuttleService.createShuttle(shuttle: Partial<Shuttle>)

// Update shuttle
await shuttleService.updateShuttle(shuttleId: string, updates: Partial<Shuttle>)

// Delete shuttle
await shuttleService.deleteShuttle(shuttleId: string)

// Get routes
await shuttleService.getRoutes(operatorId?: string)

// Create route
await shuttleService.createRoute(route: Partial<ShuttleRoute>)

// Get schedules
await shuttleService.getSchedules(routeId?: string)

// Update schedule
await shuttleService.updateSchedule(scheduleId: string, updates: Partial<ShuttleSchedule>)
```

**Current Implementation:** ✅ Complete  
**Used By:** Shuttles page

---

### 5. Pricing Service

**Purpose:** Manage fare rules and surge pricing

**Key Methods:**
```typescript
// Get pricing rules
await pricingService.getPricingRules()

// Create pricing rule
await pricingService.createPricingRule(rule: Partial<PricingRule>)

// Update pricing rule
await pricingService.updatePricingRule(ruleId: string, updates: Partial<PricingRule>)

// Delete pricing rule
await pricingService.deletePricingRule(ruleId: string)

// Get surge rules
await pricingService.getSurgeRules()

// Update surge multiplier
await pricingService.updateSurgeMultiplier(multiplier: number)
```

**Current Implementation:** ✅ Complete  
**Used By:** Pricing page

---

### 6. Promo Service

**Purpose:** Create and manage promotional codes

**Key Methods:**
```typescript
// Get promos with pagination
await promoService.getPromos(page: 1, limit: 20)

// Get active promos only
await promoService.getActivePromos()

// Create new promo
await promoService.createPromo(promo: Partial<Promo>)

// Update promo
await promoService.updatePromo(promoId: string, updates: Partial<Promo>)

// Deactivate promo
await promoService.deactivatePromo(promoId: string)

// Get promo usage stats
await promoService.getPromoUsageStats(promoId: string)
```

**Current Implementation:** ✅ Complete  
**Used By:** Promos page

---

### 7. Ads Service

**Purpose:** Manage platform advertisements

**Key Methods:**
```typescript
// Get all ads
await adsService.getAds(page: 1, limit: 20)

// Create new ad
await adsService.createAd(ad: Partial<Ad>)

// Update ad
await adsService.updateAd(adId: string, updates: Partial<Ad>)

// Pause/resume ad
await adsService.toggleAdStatus(adId: string)

// Delete ad
await adsService.deleteAd(adId: string)

// Get ad performance
await adsService.getAdPerformance(adId: string)
```

**Current Implementation:** ✅ Complete  
**Used By:** Ads page

---

### 8. Settings Service

**Purpose:** Manage platform-wide settings

**Key Methods:**
```typescript
// Get all settings
await settingsService.getAllSettings()

// Get setting by key
await settingsService.getSetting(key: string)

// Update setting
await settingsService.updateSetting(key: string, value: any)

// Bulk update settings
await settingsService.updateSettings(updates: Record<string, any>)

// Get audit logs
await settingsService.getAuditLogs(limit: 50)
```

**Current Implementation:** ✅ Complete  
**Used By:** Settings page

---

## 📄 Page Implementations

### Dashboard Page ✅

**Current State:** ✅ Mostly Complete

**Features:**
- Real-time statistics (rides, drivers, revenue)
- 7-day analytics chart
- Key metrics display
- Real-time subscriptions

**Usage:**
```typescript
import { dashboardService } from '../services/dashboardService';

const [stats, setStats] = useState<DashboardStats | null>(null);
const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);

useEffect(() => {
  // Fetch data
  const statsResponse = await dashboardService.getStats();
  
  // Subscribe to updates
  const subscription = dashboardService.subscribeToStats((updatedStats) => {
    setStats(updatedStats);
  });
  
  return () => subscription.unsubscribe();
}, []);
```

**Next Steps:**
- Add date range filter
- Add export functionality
- Add real-time alerts

---

### Drivers Page ⚠️

**Current State:** Basic implementation with table display

**Features:**
- List all drivers with pagination
- Status indicators (pending, approved, suspended, rejected)
- Search and filter
- Approval/rejection UI

**Implementation Pattern:**
```typescript
// Fetch drivers with filters
const response = await driverService.getDrivers({
  search: searchTerm,
  approvalStatus: statusFilter,
  page: currentPage,
  limit: 20
});

// Approve driver
await driverService.approveDriver({
  driver_id: driverId,
  approved: true,
  approval_notes: 'Approved by admin'
});

// Suspend driver
await driverService.suspendDriver(driverId, 'Violating terms');
```

**Next Steps:**
- Add modal for driver details
- Add document verification UI
- Add communication templates
- Real-time subscription for new applications

---

### Rides Page ⚠️

**Current State:** Basic listing with minimal details

**Features:**
- List rides with status
- Filter by status, date, fare
- Search functionality

**Implementation Pattern:**
```typescript
const response = await rideService.getRides({
  status: statusFilter,
  startDate: dateRange.start,
  endDate: dateRange.end,
  page: currentPage
});

// Cancel ride
await rideService.cancelRide(rideId, 'Safety violation');
```

**Next Steps:**
- Add ride tracking map
- Add detailed ride view modal
- Add performance metrics
- Real-time location updates

---

### Shuttles Page ⚠️

**Current State:** Basic listing

**Features:**
- List shuttles
- Create/edit shuttles
- Manage routes and schedules

**Implementation Pattern:**
```typescript
// Get shuttles
const response = await shuttleService.getShuttles(page, limit);

// Create new shuttle
await shuttleService.createShuttle({
  name: 'Shuttle 1',
  license_plate: 'ABC-123',
  capacity: 50,
  operator_id: operatorId
});

// Get routes
const routes = await shuttleService.getRoutes();
```

**Next Steps:**
- Add route builder UI
- Add schedule calendar
- Add capacity management
- Add operator dashboard

---

### Pricing Page ⚠️

**Current State:** Basic listing

**Features:**
- List pricing rules
- Create/edit rules
- Manage surge multipliers

**Implementation Pattern:**
```typescript
const rules = await pricingService.getPricingRules();

// Create pricing rule
await pricingService.createPricingRule({
  base_fare: 5000,
  per_km: 2500,
  per_minute: 500,
  minimum_fare: 3000
});
```

**Next Steps:**
- Add pricing calculator UI
- Add time-based pricing
- Add zone-based pricing
- Add A/B testing for pricing

---

### Promos Page ⚠️

**Current State:** Basic listing with create button

**Features:**
- List promos
- Create new promos
- View usage stats

**Implementation Pattern:**
```typescript
const promos = await promoService.getPromos(page, limit);

// Create promo
await promoService.createPromo({
  code: 'SUMMER20',
  discount_type: 'percentage',
  discount_value: 20,
  valid_from: new Date(),
  valid_to: new Date(Date.now() + 30*24*60*60*1000),
  max_uses: 1000
});
```

**Next Steps:**
- Add promo code generator
- Add usage tracking chart
- Add bulk code creation
- Add scheduling for future promos

---

### Ads Page ⚠️

**Current State:** Basic structure

**Features:**
- List advertisements
- Create new ads
- Track performance

**Implementation Pattern:**
```typescript
const ads = await adsService.getAds();

// Create ad
await adsService.createAd({
  title: 'Summer Rides Sale',
  description: 'Get 50% off your next ride',
  image_url: 'https://...',
  start_date: new Date(),
  end_date: new Date(Date.now() + 7*24*60*60*1000)
});
```

**Next Steps:**
- Add ad preview
- Add targeting options
- Add performance analytics
- Add A/B testing

---

### Settings Page ⚠️

**Current State:** Basic structure

**Features:**
- Manage platform settings
- View audit logs

**Implementation Pattern:**
```typescript
const settings = await settingsService.getAllSettings();

// Update setting
await settingsService.updateSetting('min_driver_rating', 4.5);

// Get audit logs
const logs = await settingsService.getAuditLogs(50);
```

**Next Steps:**
- Add settings groups/categories
- Add validation for settings
- Add audit log filtering
- Add rollback functionality

---

## 🎨 UI/UX Enhancement Checklist

### For All Pages

- [ ] Add loading skeletons (not just spinner)
- [ ] Add error boundary with recovery options
- [ ] Add empty state messages with images
- [ ] Add success toast notifications
- [ ] Add confirmation dialogs for destructive actions
- [ ] Add keyboard shortcuts
- [ ] Add accessibility labels (ARIA)
- [ ] Add mobile responsiveness

### Data Tables

- [ ] Add column sorting
- [ ] Add column filtering
- [ ] Add bulk actions (select multiple rows)
- [ ] Add export to CSV/PDF
- [ ] Add row details modal
- [ ] Add search highlighting
- [ ] Add row striping for readability
- [ ] Add hover effects

### Forms

- [ ] Add field validation with messages
- [ ] Add auto-save draft functionality
- [ ] Add field dependencies (conditional fields)
- [ ] Add date pickers
- [ ] Add timezone selection where needed
- [ ] Add file upload previews
- [ ] Add form progress indicator
- [ ] Add submission feedback

### Analytics

- [ ] Add date range selector
- [ ] Add chart type selector
- [ ] Add data export
- [ ] Add trend indicators
- [ ] Add comparison year-over-year
- [ ] Add drilldown capability
- [ ] Add custom report builder
- [ ] Add scheduled report emails

---

## 🚀 Custom Hooks for Admin

### Create Common Patterns

**Recommended hooks to create in `src/admin/hooks/`:**

#### 1. `useAdminTableData.ts`
```typescript
/**
 * Reusable hook for paginated, filterable admin tables
 * Handles loading, error, pagination, filtering, sorting
 */
export function useAdminTableData<T>(
  fetchFn: (filters: any) => Promise<ApiResponse<PaginatedResponse<T>>>,
  defaultFilters?: any
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(defaultFilters || {});

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchFn({ ...filters, page });
      setData(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [filters, page, fetchFn]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, page, setPage, total, filters, setFilters, refetch: fetch };
}
```

#### 2. `useSupabaseQuery.ts`
```typescript
/**
 * Generic hook for Supabase queries with caching
 */
export function useSupabaseQuery<T>(
  table: string,
  filters?: any,
  options?: { cache?: boolean, realtime?: boolean }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Implement caching, real-time subscriptions, etc.
  }, []);

  return { data, loading, error, refetch: () => {} };
}
```

#### 3. `useAdminAuth.ts`
```typescript
/**
 * Hook for checking admin authentication and permissions
 */
export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    // Check admin role via Supabase auth metadata
  }, []);

  return { isAdmin, isLoading, permissions, canAccess: (permission: string) => permissions.includes(permission) };
}
```

---

## 🔐 Admin Authentication

### Verify Admin Role in Admin Pages

Every admin page should check for admin role before rendering:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const AdminPageTemplate: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Check if user is admin (from auth metadata or database)
      const isAdmin = user.user_metadata?.role === 'admin';
      if (!isAdmin) {
        window.location.href = '/';
        return;
      }

      setIsAdmin(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Unauthorized</div>;

  return <div>Admin Content</div>;
};
```

---

## 🧪 Testing Admin Services

### Unit Tests for Services

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { driverService } from '@/admin/services/driverService';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase');

describe('driverService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch drivers with filters', async () => {
    const mockData = [{ id: '1', name: 'John Doe', status: 'approved' }];
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: mockData, count: 1 }),
    } as any);

    const result = await driverService.getDrivers({ search: 'John' });
    expect(result.success).toBe(true);
    expect(result.data?.data).toEqual(mockData);
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockRejectedValue(new Error('DB Error')),
    } as any);

    const result = await driverService.getDrivers({});
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

---

## 📊 Admin Dashboard Integration Status

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard Analytics | ✅ Complete | Real-time stats, 7-day chart |
| Driver Management | ⚠️ Basic | List & approve only, needs: modal, docs verification |
| Ride Monitoring | ⚠️ Basic | List only, needs: map, details modal, tracking |
| Shuttle Management | ⚠️ Basic | CRUD operations, needs: route builder, calendar |
| Pricing Control | ⚠️ Basic | List only, needs: pricing calculator, rules editor |
| Promo Management | ⚠️ Basic | CRUD only, needs: code generator, analytics |
| Ads Management | ⚠️ Basic | CRUD only, needs: preview, targeting, analytics |
| Settings | ⚠️ Basic | List only, needs: categories, validation, rollback |
| Authentication | ⚠️ Partial | Need to add admin role checks to all pages |
| Custom Hooks | ❌ None | Should create reusable table/query hooks |
| Real-time Updates | ⚠️ Partial | Dashboard only, should add to all pages |
| Error Handling | ⚠️ Basic | Generic errors, should add specific messages |
| Loading States | ⚠️ Basic | Spinners only, should add skeletons |
| UI Components | ⚠️ Basic | Inline styles, should use Tailwind + Shadcn |

---

## 🎯 Next Steps (Priority Order)

### Phase 1: Foundation (4 hours)
- [ ] Create custom hooks (useAdminTableData, useSupabaseQuery, useAdminAuth)
- [ ] Add admin auth checks to all pages
- [ ] Refactor pages to use custom hooks
- [ ] Add loading skeletons and error boundaries

### Phase 2: Enhancement (8 hours)
- [ ] Add modals for detailed views
- [ ] Add forms for create/edit operations
- [ ] Add batch operations (bulk select, actions)
- [ ] Add search and advanced filters
- [ ] Add real-time subscriptions to all pages

### Phase 3: Features (12 hours)
- [ ] Add interactive maps for ride tracking
- [ ] Add charts and analytics for all modules
- [ ] Add export functionality (CSV, PDF)
- [ ] Add communication templates (email, SMS)
- [ ] Add audit logs and change history

### Phase 4: Polish (6 hours)
- [ ] Add keyboard shortcuts
- [ ] Add accessibility improvements
- [ ] Add mobile responsiveness
- [ ] Add dark mode support
- [ ] Add performance optimizations

---

## 📞 Common Issues & Solutions

### Issue: "403 Unauthorized" Error

**Cause:** User doesn't have admin role

**Solution:**
```typescript
// Check user role in app-level auth
const { data: { user } } = await supabase.auth.getUser();
const isAdmin = user?.user_metadata?.role === 'admin';

// If not admin, redirect
if (!isAdmin) window.location.href = '/';
```

### Issue: "Realtime subscription failed"

**Cause:** RLS policies not allowing subscriptions

**Solution:**
```typescript
// Make sure RLS policies allow SELECT on tables for authenticated users
ALTER POLICY "Enable select for authenticated users" ON rides
USING (auth.uid() IS NOT NULL);
```

### Issue: Data not updating in real-time

**Cause:** Subscription not properly set up

**Solution:**
```typescript
const subscription = supabase
  .channel('rides-updates')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, (payload) => {
    setRides(prev => [...prev, payload.new]);
  })
  .subscribe();

// Clean up on unmount
return () => subscription.unsubscribe();
```

### Issue: Performance issues with large datasets

**Cause:** Loading all rows instead of pagination

**Solution:**
```typescript
// Always use pagination
const { data, count } = await supabase
  .from('rides')
  .select('*', { count: 'exact' })
  .range(0, 19);  // Limit 20 rows

// Implement infinite scroll or pagination UI
```

---

## 🔗 Related Documentation

- [Supabase Schema](../docs/supabase-schema.sql) - Database structure
- [Database Service](./SUPABASE_INTEGRATION_GUIDE.md#database-service) - Query examples
- [Authentication Service](./SUPABASE_INTEGRATION_GUIDE.md#authentication) - Auth patterns
- [Admin Quick Start](./ADMIN_QUICKSTART.md) - Quick reference
- [Migration Checklist](./MIGRATION_CHECKLIST.md) - Implementation timeline

---

**Last Updated:** April 16, 2026  
**Version:** 1.0  
**Status:** ✅ Guide Complete, Implementation In Progress
