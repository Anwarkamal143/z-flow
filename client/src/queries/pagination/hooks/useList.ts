// hooks/useOffsetPaginationList.ts
"use client";

import { getValidNumber } from "@/lib";
import { IListCallOptions, IPaginationModes } from "@/queries/v1/types";
import { IPaginationMeta } from "@/types/Iquery";
import { useEffect, useMemo } from "react";
import uesPaginationParams, {
  useCursorPaginationParams,
  useOffsetPaginationParams,
} from "./use-pagination-params";
export type IuseOffSetPaginationType<
  Client extends Record<string, any>,
  Entity extends Record<string, any> = Record<string, any>
> = ReturnType<Client["useList"]> & {
  pagination_meta: IPaginationMeta;
} & ReturnType<typeof useOffsetPaginationParams<Entity>>;

export type IuseCursorPaginationType<
  Client extends Record<string, any>,
  Entity extends Record<string, any> = Record<string, any>
> = ReturnType<Client["useList"]> & {
  pagination_meta: IPaginationMeta;
} & ReturnType<typeof useCursorPaginationParams<Entity>>;
export function useOffsetPaginationList<
  Client extends Record<string, any>,
  Options extends IListCallOptions<Client["Entity"], false, "offset">,
  Entity extends Record<string, any> = Client["Entity"]
>(client: Client, props?: Options): IuseOffSetPaginationType<Client, Entity> {
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
  } = useOffsetPaginationParams<Entity>();

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
      // if (params.includeTotal != null)
      //   update.includeTotal = params.includeTotal;
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
export function useCursorPaginationList<
  Client extends Record<string, any>,
  Options extends IListCallOptions<Client["Entity"], false, "cursor">,
  Entity extends Record<string, any> = Client["Entity"]
>(client: Client, props?: Options): IuseCursorPaginationType<Client, Entity> {
  // Use the URL-based pagination params
  const {
    params: urlParams,
    cursor,
    cursorDirection,
    limit,
    filters,
    sorts,
    search,
    includeTotal,
    setIncludeTotal,
    setCursor,
    setCursorDirection,
    setLimit,
    setFilters,
    setSorts,
    setSearch,
    setParams: setUrlParams,
    resetParams,
    validateParams,
  } = useCursorPaginationParams<Entity>();

  // Transform URL params to match your API's expected format
  const apiParams = useMemo(() => {
    return {
      cursor,
      cursorDirection,
      limit,
      filters,
      sorts,
      search,
      includeTotal,
      // Add any other params from props
      ...props?.params,
    };
  }, [
    cursor,
    cursorDirection,
    limit,
    filters,
    sorts,
    search,
    includeTotal,
    props?.params,
  ]);

  // Use your existing list hook with the transformed params
  const data = client.useList({
    ...(props || {}),
    params: apiParams,
  });

  const pagination = data?.data?.pagination_meta;
  function getURLUpdatedValues(params: Partial<typeof apiParams>) {
    const update: any = {};
    if (params) {
      if (params.cursor != null) update.cursor = params.cursor;
      if (params.cursorDirection != null)
        update.cursorDirection = params.cursorDirection;
      if (params.limit != null) update.limit = params.limit;
      if (params.filters != null) update.filters = params.filters;
      if (params.sorts != null) update.sorts = params.sorts;
      if (params.search != null) update.search = params.search;
      // if (params.includeTotal != null)
      //   update.includeTotal = params.includeTotal;
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
  const fetchNext = () => {
    if (pagination.next) {
      setCursor(pagination.next);
      return pagination.next;
    }
  };

  const fetchCurrent = (p?: number | string) => {
    if (p != null) {
      setCursor(p);
      return p;
    }
  };

  const fetchPrevious = () => {
    if (pagination.previous) {
      setCursor(pagination.previous);
      return pagination.previous;
    }
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
    cursor,
    cursorDirection,
    limit,
    filters,
    sorts,
    search,
    includeTotal,

    // API params
    params: apiParams,

    // Navigation
    fetchCurrent,
    fetchNext,
    fetchPrevious,

    // Setters
    setCursor,
    setLimit,
    setCursorDirection,
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

/*****************************************Combine Use list for both cursor and offset ***********************************/

export function useListPagination<
  Client extends Record<string, any>,
  // Options extends Client["listOptions"],
  Mode extends IPaginationModes,
  Options extends IListCallOptions<Client["Entity"], false, Mode>,
  Entity extends Record<string, any> = Client["Entity"]
>(
  client: Client,
  props?: Options & { mode?: Mode }
): Mode extends "cursor"
  ? IuseCursorPaginationType<Client, Entity>
  : Mode extends "offset"
  ? IuseOffSetPaginationType<Client, Entity>
  :
      | IuseCursorPaginationType<Client, Entity>
      | IuseOffSetPaginationType<Client, Entity> {
  const {
    limit,
    filters,
    sorts,
    search,
    includeTotal,
    setIncludeTotal,
    setLimit,
    setFilters,
    setSorts,
    setSearch,
    validateParams,
    cursorConfig,
    offsetConfig,
    mode,
  } = uesPaginationParams<Entity>(props?.mode);
  const isOffset = mode == "offset";
  const apiOffsetParams = useMemo(() => {
    return {
      page: offsetConfig.page,
      limit: offsetConfig.limit,
      filters: offsetConfig.filters,
      sorts: offsetConfig.sorts,
      search: offsetConfig.search,
      includeTotal: offsetConfig.includeTotal,
      // Add any other params from props
      ...props?.params,
    };
  }, [
    offsetConfig.page,
    offsetConfig.limit,
    offsetConfig.filters,
    offsetConfig.sorts,
    offsetConfig.search,
    offsetConfig.includeTotal,
    props?.params,
  ]);
  const apiCursorParams = useMemo(() => {
    return {
      cursor: cursorConfig.cursor,
      cursorDirection: cursorConfig.cursorDirection,
      limit: cursorConfig.limit,
      filters: cursorConfig.filters,
      sorts: cursorConfig.sorts,
      search: cursorConfig.search,
      includeTotal: cursorConfig.includeTotal,
      // Add any other params from props
      ...props?.params,
    };
  }, [
    cursorConfig.cursor,
    cursorConfig.cursorDirection,
    cursorConfig.limit,
    cursorConfig.filters,
    cursorConfig.sorts,
    cursorConfig.search,
    cursorConfig.includeTotal,
    props?.params,
  ]);
  // Use your existing suspense list hook
  const data = client.useList({
    ...(props || {}),
    params: isOffset ? apiOffsetParams : apiCursorParams,
  });

  const pagination = data?.data?.pagination_meta;
  function getURLUpdatedValues(
    params: Partial<typeof apiOffsetParams | typeof apiCursorParams>
  ) {
    const update: any = {};
    if (params) {
      if (isOffset) {
        if (params.page != null) update.page = params.page;
      }
      if (!isOffset) {
        if (params.cursor != null) update.cursor = params.cursor;
        if (params.cursorDirection != null)
          update.cursorDirection = params.cursorDirection;
      }
      if (params.limit != null) update.limit = params.limit;
      if (params.filters != null) update.filters = params.filters;
      if (params.sorts != null) update.sorts = params.sorts;
      if (params.search != null) update.search = params.search;
      // if (params.includeTotal != null)
      //   update.includeTotal = params.includeTotal;
    }
    return update;
  }
  // Sync URL params when props change
  useEffect(() => {
    if (props?.params) {
      const update = getURLUpdatedValues(props.params);

      if (Object.keys(update).length > 0) {
        if (isOffset) {
          offsetConfig.setParams(update);
          return;
        }
        cursorConfig.setParams(update);
      }
    }
  }, [props?.params]);

  // Navigation functions
  const fetchNext = () => {
    if (pagination.next) {
      if (isOffset) {
        const page = getValidNumber(pagination.next);
        if (page == null || !pagination) return null;
        offsetConfig.setPage(page);
        return page;
      }

      cursorConfig.setCursor(pagination.next);
      return pagination.next;
    }
  };

  const fetchCurrent = (p?: number | string) => {
    if (p != null) {
      if (isOffset) {
        const page = getValidNumber(p);
        if (page == null || !pagination) return null;
        offsetConfig.setPage(page);
        return page;
      }

      cursorConfig.setCursor(p);
      return p;
    }
  };

  const fetchPrevious = () => {
    if (pagination.previous) {
      if (isOffset) {
        const page = getValidNumber(pagination.previous);
        if (page == null || !pagination) return null;
        offsetConfig.setPage(page);
        return page;
      }

      cursorConfig.setCursor(pagination.previous);
      return pagination.previous;
    }
  };
  // Combined setParams
  const setParams = (
    update: Partial<typeof apiOffsetParams | typeof apiCursorParams>
  ) => {
    const urlUpdate = getURLUpdatedValues(update);
    if (isOffset) {
      offsetConfig.setParams(urlUpdate);
      return;
    }
    cursorConfig.setParams(urlUpdate);
  };
  const common = {
    setParams,
    fetchPrevious,
    fetchNext,
    fetchCurrent,
    mode,
  };
  const offsetResult = {
    page: offsetConfig.page,
    setPage: offsetConfig.setPage,
  };
  const cursorResult = {
    cursor: cursorConfig.cursor,
    cursorDirection: cursorConfig.cursorDirection,
    setCursor: cursorConfig.setCursor,
  };
  return {
    ...(isOffset ? offsetResult : cursorResult),
    // Data from your existing hook
    ...data,
    ...common,
    // URL-based pagination state
    urlParams: isOffset ? offsetConfig.params : cursorConfig.params,

    limit,
    filters,
    sorts,
    search,
    includeTotal,

    // API params
    params: isOffset ? apiOffsetParams : apiCursorParams,

    // Navigation
    fetchNext,
    fetchPrevious,
    fetchCurrent,

    // Setters
    setLimit,
    setFilters,
    setSorts,
    setSearch,
    setIncludeTotal,
    setParams,

    // Validation and reset
    validateParams,
    resetParams: isOffset ? offsetConfig.resetParams : cursorConfig.resetParams,

    // Pagination metadata
    pagination_meta: pagination,
  };
}
