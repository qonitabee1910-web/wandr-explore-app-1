/**
 * Admin Table Data Hook
 * Reusable hook for paginated, filterable, sortable admin tables
 * Handles loading, error states, and provides refetch capability
 */

import { useState, useCallback, useEffect } from 'react';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TableFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

interface UseAdminTableDataOptions {
  defaultLimit?: number;
  defaultFilters?: Partial<TableFilters>;
  autoFetch?: boolean;
}

export function useAdminTableData<T>(
  fetchFn: (filters: TableFilters) => Promise<ApiResponse<PaginatedResponse<T>>>,
  options: UseAdminTableDataOptions = {}
) {
  const { defaultLimit = 20, defaultFilters = {}, autoFetch = true } = options;

  // State
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<TableFilters>({
    limit: defaultLimit,
    ...defaultFilters,
  });

  // Fetch data
  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchFn({
        ...filters,
        page,
        limit: filters.limit || defaultLimit,
      });

      if (response.success && response.data) {
        setData(response.data.data);
        setTotal(response.data.total);
      } else {
        throw new Error(response.error || 'Failed to fetch data');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page, fetchFn, defaultLimit]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [fetch, autoFetch]);

  // Update filters and reset to page 1
  const updateFilters = useCallback((newFilters: Partial<TableFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  // Update specific filter
  const setFilterValue = useCallback((key: string, value: any) => {
    updateFilters({ [key]: value });
  }, [updateFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({ limit: defaultLimit });
    setPage(1);
  }, [defaultLimit]);

  // Search
  const search = useCallback((searchTerm: string) => {
    setFilterValue('search', searchTerm);
  }, [setFilterValue]);

  // Sort
  const sort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
    updateFilters({ sortBy, sortOrder });
  }, [updateFilters]);

  // Pagination
  const goToPage = useCallback((pageNum: number) => {
    setPage(Math.max(1, Math.min(pageNum, Math.ceil(total / (filters.limit || defaultLimit)))));
  }, [total, filters.limit, defaultLimit]);

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(page - 1);
  }, [page, goToPage]);

  const totalPages = Math.ceil(total / (filters.limit || defaultLimit));

  return {
    // Data
    data,
    total,
    loading,
    error,

    // Pagination
    page,
    setPage: goToPage,
    nextPage,
    prevPage,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,

    // Filters
    filters,
    updateFilters,
    setFilterValue,
    clearFilters,
    search,
    sort,

    // Utilities
    refetch: fetch,
    isEmpty: data.length === 0 && !loading,
    isLoading: loading,
    isError: error !== null,
  };
}
