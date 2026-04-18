# ✅ Admin Dashboard Integration Checklist

## Phase 1: Foundation Setup (Est. 4 hours)

### 1.1 Custom Hooks Creation
- [ ] Create `src/admin/hooks/useAdminTableData.ts`
  - Implements pagination, filtering, sorting
  - Handles loading and error states
  - Provides refetch capability
  - **Estimated Time:** 1 hour
  - **Dependencies:** React, types

- [ ] Create `src/admin/hooks/useAdminAuth.ts`
  - Check admin authentication
  - Verify admin role
  - Handle unauthorized access
  - **Estimated Time:** 30 min
  - **Dependencies:** Supabase, auth

- [ ] Create `src/admin/hooks/useAdminForm.ts`
  - Handle form validation
  - Track form state
  - Submit and error handling
  - **Estimated Time:** 30 min
  - **Dependencies:** Zod or similar validator

- [ ] Create `src/admin/hooks/index.ts`
  - Export all custom hooks
  - **Estimated Time:** 5 min

### 1.2 Admin Context Setup
- [ ] Create `src/admin/context/AdminContext.tsx`
  - Global admin state
  - Current admin user
  - Permissions
  - **Estimated Time:** 30 min
  - **Usage:** Share admin data across pages

- [ ] Add admin context provider to `AdminLayout.tsx`
  - Wrap admin pages with context
  - Initialize on mount
  - **Estimated Time:** 15 min

### 1.3 Page Authentication
- [ ] Add admin auth check to Dashboard.tsx
  - Redirect if not admin
  - Show loading state
  - **Estimated Time:** 15 min

- [ ] Add admin auth check to Drivers.tsx
  - Redirect if not admin
  - **Estimated Time:** 15 min

- [ ] Add admin auth check to Rides.tsx
  - Redirect if not admin
  - **Estimated Time:** 15 min

- [ ] Add admin auth check to Shuttles.tsx
  - Redirect if not admin
  - **Estimated Time:** 15 min

- [ ] Add admin auth check to Pricing.tsx
  - Redirect if not admin
  - **Estimated Time:** 15 min

- [ ] Add admin auth check to Promos.tsx
  - Redirect if not admin
  - **Estimated Time:** 15 min

- [ ] Add admin auth check to Ads.tsx
  - Redirect if not admin
  - **Estimated Time:** 15 min

- [ ] Add admin auth check to Settings.tsx
  - Redirect if not admin
  - **Estimated Time:** 15 min

**Phase 1 Subtotal:** 4 hours

---

## Phase 2: Core Page Enhancement (Est. 6 hours)

### 2.1 Dashboard Page
- [ ] Replace manual fetch with `useAdminTableData`
  - Refactor data fetching
  - **Estimated Time:** 30 min
- [ ] Add date range selector
  - Filter analytics by date
  - **Estimated Time:** 45 min
- [ ] Add chart interactions
  - Click-through to details
  - **Estimated Time:** 30 min
- [ ] Add export functionality
  - Export stats to CSV
  - **Estimated Time:** 45 min
- [ ] Add real-time alert indicators
  - Show alerts for anomalies
  - **Estimated Time:** 45 min

**Subtotal:** 3.5 hours

### 2.2 Drivers Page
- [ ] Refactor with `useAdminTableData`
  - Use custom hook
  - **Estimated Time:** 30 min
- [ ] Add driver detail modal
  - View full driver info
  - Display documents
  - **Estimated Time:** 1 hour
- [ ] Add approval/rejection modal
  - Notes field
  - Reason field
  - **Estimated Time:** 45 min
- [ ] Add document verification UI
  - View driver documents
  - Verify/reject documents
  - **Estimated Time:** 1 hour
- [ ] Add bulk actions
  - Select multiple drivers
  - Bulk approve/suspend
  - **Estimated Time:** 45 min
- [ ] Add search and filters
  - Name, email, phone search
  - Status filter
  - Rating filter
  - **Estimated Time:** 45 min
- [ ] Add real-time subscriptions
  - New driver applications
  - Status updates
  - **Estimated Time:** 45 min

**Subtotal:** 5.5 hours

### 2.3 Rides Page
- [ ] Refactor with `useAdminTableData`
  - Use custom hook
  - **Estimated Time:** 30 min
- [ ] Add ride detail modal
  - Full ride information
  - Driver and user info
  - **Estimated Time:** 1 hour
- [ ] Add map display
  - Show pickup and dropoff
  - Show route
  - **Estimated Time:** 1.5 hours
- [ ] Add cancel ride with reason
  - Modal for cancellation
  - Reason selection
  - **Estimated Time:** 45 min
- [ ] Add filters and search
  - Status filter
  - Date range filter
  - Fare range filter
  - **Estimated Time:** 45 min
- [ ] Add real-time tracking
  - Subscribe to ride updates
  - Show live location
  - **Estimated Time:** 1 hour

**Subtotal:** 5.5 hours

### 2.4 Shuttles Page
- [ ] Refactor with `useAdminTableData`
  - Use custom hook
  - **Estimated Time:** 30 min
- [ ] Add create shuttle form
  - Modal form
  - Validation
  - **Estimated Time:** 1 hour
- [ ] Add edit shuttle modal
  - Update shuttle details
  - **Estimated Time:** 45 min
- [ ] Add route management
  - Create/edit/delete routes
  - Route builder UI
  - **Estimated Time:** 1.5 hours
- [ ] Add schedule management
  - Calendar view
  - Add/edit schedules
  - **Estimated Time:** 1 hour
- [ ] Add seat management
  - View seat availability
  - Manage seat capacity
  - **Estimated Time:** 45 min

**Subtotal:** 5.5 hours

### 2.5 Pricing Page
- [ ] Refactor with `useAdminTableData`
  - Use custom hook
  - **Estimated Time:** 30 min
- [ ] Add pricing rule form
  - Create new rule
  - Modal form with validation
  - **Estimated Time:** 1 hour
- [ ] Add rule editor modal
  - Edit existing rules
  - Preview fare calculation
  - **Estimated Time:** 1 hour
- [ ] Add surge multiplier controls
  - View current multiplier
  - Update multiplier
  - **Estimated Time:** 45 min
- [ ] Add pricing calculator
  - Test fare calculation
  - See impact of rules
  - **Estimated Time:** 1 hour
- [ ] Add time-based pricing editor
  - Configure time slots
  - Set different rates
  - **Estimated Time:** 1 hour

**Subtotal:** 5 hours

**Phase 2 Subtotal:** 24.5 hours

---

## Phase 3: Advanced Features (Est. 8 hours)

### 3.1 Promo Management
- [ ] Add promo code generator
  - Generate unique codes
  - Bulk generation
  - **Estimated Time:** 1 hour
- [ ] Add usage analytics
  - Chart of promo usage
  - Revenue impact
  - **Estimated Time:** 1 hour
- [ ] Add promo duration editor
  - Date range picker
  - Timezone support
  - **Estimated Time:** 45 min
- [ ] Add promo conditions
  - Min order value
  - User segments
  - **Estimated Time:** 1 hour

**Subtotal:** 3.75 hours

### 3.2 Ads Management
- [ ] Add ad preview
  - Desktop preview
  - Mobile preview
  - **Estimated Time:** 1 hour
- [ ] Add ad targeting
  - Select user segments
  - Geographic targeting
  - **Estimated Time:** 1 hour
- [ ] Add ad performance dashboard
  - Impressions, clicks, CTR
  - Revenue generated
  - **Estimated Time:** 1.5 hours
- [ ] Add A/B testing
  - Create test variants
  - Compare performance
  - **Estimated Time:** 1.5 hours

**Subtotal:** 5 hours

### 3.3 Settings Page
- [ ] Add settings organization
  - Group by category
  - Searchable
  - **Estimated Time:** 45 min
- [ ] Add validation for settings
  - Type checking
  - Range validation
  - **Estimated Time:** 45 min
- [ ] Add audit log viewer
  - Filterable log table
  - Search and sort
  - **Estimated Time:** 1 hour
- [ ] Add rollback functionality
  - Revert settings changes
  - Confirm before rollback
  - **Estimated Time:** 1 hour
- [ ] Add settings backup/export
  - Download current settings
  - Import settings
  - **Estimated Time:** 1 hour

**Subtotal:** 4.5 hours

**Phase 3 Subtotal:** 9.5 hours

---

## Phase 4: UI/UX Polish (Est. 6 hours)

### 4.1 Loading States
- [ ] Add skeleton loaders
  - For tables (5 placeholder rows)
  - For modals
  - For cards
  - **Estimated Time:** 1.5 hours

### 4.2 Error Handling
- [ ] Add error boundaries
  - Page-level boundaries
  - Component-level boundaries
  - **Estimated Time:** 1 hour
- [ ] Add error messages
  - User-friendly messages
  - Action buttons (retry, report)
  - **Estimated Time:** 45 min

### 4.3 Empty States
- [ ] Add empty state illustrations
  - For empty tables
  - For empty lists
  - **Estimated Time:** 1 hour

### 4.4 Notifications
- [ ] Add toast notifications
  - Success toasts
  - Error toasts
  - **Estimated Time:** 45 min
- [ ] Add confirmation dialogs
  - Before destructive actions
  - **Estimated Time:** 45 min

### 4.5 Accessibility
- [ ] Add ARIA labels
  - Buttons and links
  - Form fields
  - **Estimated Time:** 1 hour
- [ ] Add keyboard navigation
  - Tab order
  - Keyboard shortcuts
  - **Estimated Time:** 1 hour

**Phase 4 Subtotal:** 6 hours

---

## Phase 5: Real-time Features (Est. 4 hours)

### 5.1 Real-time Subscriptions
- [ ] Add subscriptions to Drivers page
  - New driver applications
  - Status changes
  - **Estimated Time:** 1 hour

- [ ] Add subscriptions to Rides page
  - New ride requests
  - Ride status updates
  - Location updates
  - **Estimated Time:** 1.5 hours

- [ ] Add subscriptions to Shuttles page
  - Schedule changes
  - Capacity updates
  - **Estimated Time:** 45 min

- [ ] Add subscriptions to other pages
  - Promo usage
  - Ad performance
  - **Estimated Time:** 45 min

**Phase 5 Subtotal:** 4 hours

---

## Phase 6: Testing (Est. 6 hours)

### 6.1 Unit Tests
- [ ] Test dashboard service
  - Stats calculation
  - Data formatting
  - **Estimated Time:** 1 hour
- [ ] Test driver service
  - Filtering logic
  - Approval logic
  - **Estimated Time:** 1 hour
- [ ] Test ride service
  - Query building
  - Cancellation logic
  - **Estimated Time:** 1 hour

### 6.2 Integration Tests
- [ ] Test dashboard page
  - Data loading
  - Real-time updates
  - **Estimated Time:** 1 hour
- [ ] Test driver approval flow
  - Fetch drivers
  - Approve driver
  - Verify update
  - **Estimated Time:** 1 hour

### 6.3 E2E Tests (Optional)
- [ ] Test complete admin workflows
  - Admin login
  - Navigate pages
  - Perform actions
  - **Estimated Time:** 1 hour

**Phase 6 Subtotal:** 6 hours

---

## Phase 7: Performance Optimization (Est. 2 hours)

### 7.1 Query Optimization
- [ ] Add request debouncing
  - Debounce search input
  - **Estimated Time:** 30 min
- [ ] Add query result caching
  - Cache frequently accessed data
  - **Estimated Time:** 45 min
- [ ] Add batch operations
  - Bulk queries instead of individual
  - **Estimated Time:** 45 min

**Phase 7 Subtotal:** 2 hours

---

## Phase 8: Deployment (Est. 2 hours)

### 8.1 Pre-deployment Checks
- [ ] Verify all admin pages work
  - Test all features
  - **Estimated Time:** 30 min
- [ ] Security audit
  - Check RLS policies
  - Verify auth checks
  - **Estimated Time:** 45 min
- [ ] Performance test
  - Check page load times
  - Check large dataset handling
  - **Estimated Time:** 45 min

**Phase 8 Subtotal:** 2 hours

---

## Summary

| Phase | Title | Time | Status |
|-------|-------|------|--------|
| 1 | Foundation Setup | 4h | ⏳ Ready |
| 2 | Core Enhancement | 24.5h | ⏳ Ready |
| 3 | Advanced Features | 9.5h | ⏳ Next |
| 4 | UI/UX Polish | 6h | ⏳ Next |
| 5 | Real-time Features | 4h | ⏳ Next |
| 6 | Testing | 6h | ⏳ Next |
| 7 | Optimization | 2h | ⏳ Next |
| 8 | Deployment | 2h | ⏳ Final |
| **TOTAL** | **Admin Dashboard** | **~58 hours** | ⏳ |

---

## Quick Start (30 minutes)

If you want to get something working quickly:

### 1. Create Admin Auth Hook (10 min)
```typescript
// src/admin/hooks/useAdminAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.user_metadata?.role === 'admin';
    setIsAdmin(isAdmin || false);
    setLoading(false);
  };

  return { isAdmin, loading };
}
```

### 2. Add Auth Check to Dashboard (5 min)
```typescript
// src/admin/pages/Dashboard.tsx
import { useAdminAuth } from '../hooks/useAdminAuth';

export const DashboardPage: React.FC = () => {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Unauthorized</div>;

  // ... rest of component
};
```

### 3. Add to Other Pages (15 min)
Copy the same pattern to all 8 admin pages.

---

## Detailed Implementation Order

### Day 1 (Phase 1)
1. Create `useAdminAuth` hook - 30 min
2. Add auth checks to all 8 pages - 2 hours
3. Create `useAdminTableData` hook - 1 hour
4. Refactor Dashboard with hook - 30 min

### Day 2 (Phase 2 - Drivers & Rides)
1. Refactor Drivers page - 1 hour
2. Add driver detail modal - 1 hour
3. Add approval modal - 45 min
4. Refactor Rides page - 1 hour
5. Add ride detail modal - 1 hour

### Day 3 (Phase 2 - Other pages)
1. Refactor Shuttles, Pricing, Promos - 3 hours
2. Add modals and forms - 3 hours

### Day 4 (Phase 3 & 4)
1. Add advanced features - 4 hours
2. Polish UI/UX - 4 hours

---

## Success Criteria

✅ All admin pages have authentication checks  
✅ All pages use custom hooks for data fetching  
✅ All CRUD operations work correctly  
✅ Real-time subscriptions working  
✅ Error handling and loading states present  
✅ Mobile responsive  
✅ Accessible (ARIA labels)  
✅ Tested (unit and integration)  

---

**Last Updated:** April 16, 2026  
**Status:** Ready to Implement  
**Next Action:** Start Phase 1 - Create Custom Hooks
