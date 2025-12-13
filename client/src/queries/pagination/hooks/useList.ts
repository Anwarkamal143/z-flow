// hooks/useOffsetPaginationList.ts
"use client";

import { getValidNumber } from "@/lib";
import { IPaginationMeta } from "@/types/Iquery";
import { useEffect, useMemo } from "react";
import { useOffsetPagination } from "./use-pagination-params";

export function useOffsetPaginationList<
  Client extends Record<string, any>,
  Options extends Client["listOptions"],
  Entity extends Record<string, any> = Client["Entity"]
>(
  client: Client,
  props?: Options
): ReturnType<Client["useList"]> &
  ReturnType<typeof useOffsetPagination<Entity>> & {
    pagination_meta: IPaginationMeta;
  } {
  // Use the URL-based pagination params
  const {
    params: urlParams,
    page,
    limit,
    filters,
    sorts,
    search,
    includeTotal,
    setIncludeTotal,
    setPage,
    setLimit,
    setFilters,
    setSorts,
    setSearch,
    setParams: setUrlParams,
    resetParams,
    validateParams,
  } = useOffsetPagination<Entity>();

  // Transform URL params to match your API's expected format
  const apiParams = useMemo(() => {
    return {
      page,
      limit,
      filters,
      sorts,
      search,
      includeTotal,
      // Add any other params from props
      ...props?.params,
    };
  }, [page, limit, filters, sorts, search, includeTotal, props?.params]);

  // Use your existing list hook with the transformed params
  const data = client.useList({
    ...(props || {}),
    params: apiParams,
  });

  const pagination = data?.data?.pagination_meta;
  function getURLUpdatedValues(params: Partial<typeof apiParams>) {
    const update: any = {};
    if (params) {
      if (params.page != null) update.page = params.page;
      if (params.limit != null) update.limit = params.limit;
      if (params.filters != null) update.filters = params.filters;
      if (params.sorts != null) update.sorts = params.sorts;
      if (params.search != null) update.search = params.search;
      if (params.includeTotal != null)
        update.includeTotal = params.includeTotal;
    }
    return update;
  }
  // Sync URL params when props change (for initial load)
  useEffect(() => {
    if (props?.params) {
      const update = getURLUpdatedValues(props.params);

      if (Object.keys(update).length > 0) {
        setUrlParams(update);
      }
    }
  }, [props?.params, setUrlParams]);

  // Navigation functions
  const fetchNextPage = (p = page) => {
    const current = getValidNumber(p);
    if (current == null || !pagination) return null;

    if (current >= pagination.totalPages) return null;

    const next = current + 1;
    setPage(next);
    return next;
  };

  const fetchCurrentPage = (p?: number | string) => {
    const current = getValidNumber(p);
    if (current == null || !pagination) return null;

    if (current < 1 || current > pagination.totalPages) return null;

    setPage(current);
    return current;
  };

  const fetchPreviousPage = (p = page) => {
    const current = getValidNumber(p);
    if (current == null || !pagination) return null;

    if (current <= 1) return null;

    const prev = current - 1;
    setPage(prev);
    return prev;
  };

  // Combined setParams that updates both URL and local state
  const setParams = (update: Partial<typeof apiParams>) => {
    const urlUpdate = getURLUpdatedValues(update);

    setUrlParams(urlUpdate);
  };

  return {
    // Data from your existing hook
    ...data,

    // URL-based pagination state
    urlParams,
    page,
    limit,
    filters,
    sorts,
    search,
    includeTotal,

    // API params
    params: apiParams,

    // Navigation
    fetchNextPage,
    fetchPreviousPage,
    fetchCurrentPage,

    // Setters
    setPage,
    setLimit,
    setFilters,
    setSorts,
    setSearch,
    setIncludeTotal,
    setParams,

    // Validation and reset
    validateParams,
    resetParams,

    // Pagination metadata
    pagination_meta: pagination,
  };
}

// Similar hook for suspense
export function useSuspenseOffsetPaginationList<
  Client extends Record<string, any>,
  Options extends Client["listOptions"],
  Entity extends Record<string, any> = Client["Entity"]
>(
  client: Client,
  props?: Options
): ReturnType<Client["useSuspenseList"]> &
  ReturnType<typeof useOffsetPagination<Entity>> & {
    pagination_meta: IPaginationMeta;
  } {
  // Use the URL-based pagination params
  const {
    params: urlParams,
    page,
    limit,
    filters,
    sorts,
    search,
    includeTotal,
    setIncludeTotal,
    setPage,
    setLimit,
    setFilters,
    setSorts,
    setSearch,
    setParams: setUrlParams,
    resetParams,
    validateParams,
  } = useOffsetPagination<Entity>();

  // Transform URL params to match your API's expected format
  const apiParams = useMemo(() => {
    return {
      page,
      limit,
      filters,
      sorts,
      search,
      includeTotal,
      // Add any other params from props
      ...props?.params,
    };
  }, [page, limit, filters, sorts, search, includeTotal, props?.params]);
  // Use your existing suspense list hook
  const data = client.useSuspenseList({
    ...(props || {}),
    params: apiParams,
  });

  const pagination = data?.data?.pagination_meta;
  function getURLUpdatedValues(params: Partial<typeof apiParams>) {
    const update: any = {};
    if (params) {
      if (params.page != null) update.page = params.page;
      if (params.limit != null) update.limit = params.limit;
      if (params.filters != null) update.filters = params.filters;
      if (params.sorts != null) update.sorts = params.sorts;
      if (params.search != null) update.search = params.search;
      if (params.includeTotal != null)
        update.includeTotal = params.includeTotal;
    }
    return update;
  }
  // Sync URL params when props change
  useEffect(() => {
    if (props?.params) {
      const update = getURLUpdatedValues(props.params);

      if (Object.keys(update).length > 0) {
        setUrlParams(update);
      }
    }
  }, [props?.params, setUrlParams]);

  // Navigation functions
  const fetchNextPage = (p = page) => {
    const current = getValidNumber(p);
    if (current == null || !pagination) return null;

    if (current >= pagination.totalPages) return null;

    const next = current + 1;
    setPage(next);
    return next;
  };

  const fetchCurrentPage = (p?: number | string) => {
    const current = getValidNumber(p);
    if (current == null || !pagination) return null;

    if (current < 1 || current > pagination.totalPages) return null;

    setPage(current);
    return current;
  };

  const fetchPreviousPage = (p = page) => {
    const current = getValidNumber(p);
    if (current == null || !pagination) return null;

    if (current <= 1) return null;

    const prev = current - 1;
    setPage(prev);
    return prev;
  };

  // Combined setParams
  const setParams = (update: Partial<typeof apiParams>) => {
    const urlUpdate = getURLUpdatedValues(update);

    setUrlParams(urlUpdate);
  };

  return {
    // Data from your existing hook
    ...data,

    // URL-based pagination state
    urlParams,
    page,
    limit,
    filters,
    sorts,
    search,
    includeTotal,

    // API params
    params: apiParams,

    // Navigation
    fetchNextPage,
    fetchPreviousPage,
    fetchCurrentPage,

    // Setters
    setPage,
    setLimit,
    setFilters,
    setSorts,
    setSearch,
    setIncludeTotal,
    setParams,

    // Validation and reset
    validateParams,
    resetParams,

    // Pagination metadata
    pagination_meta: pagination,
  };
}
