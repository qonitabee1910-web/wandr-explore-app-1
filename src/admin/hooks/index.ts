/**
 * Admin Hooks
 * Centralized export of all admin custom hooks
 */

export { useAdminTableData } from './useAdminTableData';
export type { UseAdminFormOptions, ValidationError } from './useAdminForm';
export { useAdminForm } from './useAdminForm';
export { useAdminAuth, AdminPermissions } from './useAdminAuth';
export type { AdminUser } from './useAdminAuth';
export type { PaginatedResponse, ApiResponse, TableFilters } from './useAdminTableData';
