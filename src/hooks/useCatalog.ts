'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiClient } from '@/lib/api';
import { Tool, ToolCategory, ToolFilters } from '@/types';

export interface CatalogState {
  tools: Tool[];
  categories: ToolCategory[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useCatalog = () => {
  const [state, setState] = useState<CatalogState>({
    tools: [],
    categories: [],
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: true,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    },
  });

  const [filters, setFilters] = useState<ToolFilters>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchTools = useCallback(async (page = 1, append = false) => {
    if (page === 1) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    } else {
      setState(prev => ({ ...prev, loadingMore: true, error: null }));
    }
    
    try {
      const response = await ApiClient.getTools(filters, page, state.pagination.limit);
      
      setState(prev => ({
        ...prev,
        tools: append ? [...prev.tools, ...response.data.tools] : response.data.tools,
        pagination: response.data.pagination,
        hasMore: response.data.pagination.page < response.data.pagination.pages,
        loading: false,
        loadingMore: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch tools',
        loading: false,
        loadingMore: false,
      }));
    }
  }, [filters, state.pagination.limit]);

  const loadMore = useCallback(() => {
    if (!state.loadingMore && state.hasMore) {
      fetchTools(state.pagination.page + 1, true);
    }
  }, [fetchTools, state.pagination.page, state.loadingMore, state.hasMore]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await ApiClient.getCategories();
      setState(prev => ({
        ...prev,
        categories: response.data.categories,
      }));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<ToolFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && state.hasMore && !state.loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, state.hasMore, state.loadingMore]);

  // Fetch tools when filters change (reset to page 1)
  useEffect(() => {
    fetchTools(1, false);
  }, [filters]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    ...state,
    filters,
    updateFilters,
    clearFilters,
    loadMore,
    loadMoreRef,
    refetch: () => fetchTools(1, false),
  };
};