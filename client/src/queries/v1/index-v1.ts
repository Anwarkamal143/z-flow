/* eslint-disable @typescript-eslint/no-explicit-any */
/* =============================
   Enhanced CRUD Client Factory
   ============================= */

import { getQueryClient } from "@/get-query-client";
import { IRequestOptions, Model } from "@/models";
import {
  IApiResponse,
  IApiResponseHooks,
  IPaginatedReturnType,
  IPaginationMeta,
  IPartialIfExist,
  IResponseError,
  ReturnModelType,
} from "@/types/Iquery";
import {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
  UseSuspenseInfiniteQueryOptions,
  UseSuspenseQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useSuspenseInfiniteQuery,
  useSuspenseQueries,
  useSuspenseQuery,
} from "@tanstack/react-query";

/* -----------------------
   Core Types
   ----------------------- */

export type Id = string | number;
export type SortOrder = "asc" | "desc";
export type DefaultError = IResponseError<null>;
export type ReturnModel<TEntity, Entity> = ReturnModelType<TEntity, Entity>;
export type ApiHooksResp<T> = IApiResponseHooks<T>;

/* -----------------------
   Parameter Types
   ----------------------- */

export type BaseParams = {
  entity?: string;
  [key: string]: any; // This allows additional properties in all param types
};

export type OffsetPaginationParams<T = Record<string, any>> = BaseParams & {
  page?: number;
  limit?: number;
  isEnabled?: boolean;
  sort?: SortOrder;
  sortBy?: keyof T;
};

export type CursorPaginationParams<T = Record<string, any>> = BaseParams & {
  cursor?: string;
  limit: number;
  isEnabled?: boolean;
  sort?: SortOrder;
  sortBy?: T;
};

export type QueryParams<T = Record<string, any>> =
  | OffsetPaginationParams<T>
  | CursorPaginationParams<T>;

/* -----------------------
   Request Options
   ----------------------- */

export type RequestOptions = {
  query?: QueryParams;
  path?: string;
  requestOptions?: Partial<IRequestOptions>;
};

export type CallOptions<T = Record<string, any>> = {
  params?: QueryParams<T>;
  options?: RequestOptions;
  queryKey?: QueryKey;
};

/* -----------------------
   Response Types
   ----------------------- */

export type ListData<T> = { data: T; pagination_meta: IPaginationMeta };
export type InfiniteListData<T> = InfiniteData<ListData<T>, unknown>;

export type ListReturnType<T> = {
  pagination_meta: IPaginationMeta | undefined;
  data: T;
  pageParams: unknown[];
  pages: { data: T; pagination_meta: IPaginationMeta }[];
};

/* -----------------------
   Query Option Types
   ----------------------- */

// Generic query options based on suspense mode
type QueryOptions<T, S extends boolean, ErrorT = DefaultError> = S extends true
  ? UseSuspenseQueryOptions<ApiHooksResp<T>, ErrorT, ListData<T>, QueryKey>
  : UseQueryOptions<ApiHooksResp<T>, ErrorT, ListData<T>, QueryKey>;

type InfiniteQueryOptions<
  T,
  S extends boolean,
  ErrorT = DefaultError
> = S extends true
  ? UseSuspenseInfiniteQueryOptions<
      ApiHooksResp<T>,
      ErrorT,
      InfiniteListData<T>,
      QueryKey
    >
  : UseInfiniteQueryOptions<
      ApiHooksResp<T>,
      ErrorT,
      InfiniteListData<T>,
      QueryKey
    >;

/* -----------------------
   Operation Options
   ----------------------- */

type CommonListOptions<T, S extends boolean = false, ErrorT = DefaultError> = {
  options?: RequestOptions;
  queryOptions?: Omit<QueryOptions<T, S, ErrorT>, "queryKey">;
  queryKey?: QueryKey;
};

export type ListCallOptions<
  T,
  S extends boolean = false,
  ErrorT = DefaultError
> = CommonListOptions<T, S, ErrorT> & {
  infiniteOptions?: Partial<
    Omit<InfiniteQueryOptions<T, S, ErrorT>, "queryKey">
  >;
  getNextPageParam?: InfiniteQueryOptions<T, S, ErrorT>["getNextPageParam"];
  onSuccess?: (data: ListReturnType<T>) => void;
};

export type CursorCallOptions<
  T,
  S extends boolean = false,
  ErrorT = DefaultError
> = {
  params?: CursorPaginationParams;
  onSuccess?: (data: ListReturnType<T>) => void;
} & ListCallOptions<T, S, ErrorT>;

export type OffsetCallOptions<
  T,
  S extends boolean = false,
  ErrorT = DefaultError
> = CommonListOptions<T, S, ErrorT> & {
  params?: OffsetPaginationParams;
  onSuccess?: (data: IPaginatedReturnType<T>) => void;
};

export type MutationCallOptions<
  TData = any,
  TVars = any,
  ErrorT = DefaultError
> = {
  params?: Record<string, any>;
  options?: RequestOptions;
  mutationOptions?: UseMutationOptions<IApiResponse<TData>, ErrorT, TVars>;
  onSuccess?: (data: TData) => void;
};

type CommonQueryOptions<
  TEntity,
  Entity,
  S extends boolean = false,
  ErrorT = DefaultError
> = {
  queryOptions?: S extends true
    ? Omit<
        UseSuspenseQueryOptions<
          ApiHooksResp<ReturnModel<TEntity, Entity>>,
          ErrorT,
          ApiHooksResp<ReturnModel<TEntity, Entity>>,
          QueryKey
        >,
        "queryKey"
      >
    : Omit<
        UseQueryOptions<
          ApiHooksResp<ReturnModel<TEntity, Entity>>,
          ErrorT,
          ApiHooksResp<ReturnModel<TEntity, Entity>>,
          QueryKey
        >,
        "queryKey"
      >;
};

export type SingleQueryOptions<
  TEntity,
  Entity,
  S extends boolean = false,
  ErrorT = DefaultError
> = CallOptions<ReturnModel<TEntity, Entity>> & {
  id?: Id;
  onSuccess?: (data: ApiHooksResp<ReturnModel<TEntity, Entity>>) => void;
} & CommonQueryOptions<TEntity, Entity, S, ErrorT>;

export type MultiQueryOptions<
  TEntity,
  Entity,
  S extends boolean = false,
  ErrorT = DefaultError
> = CallOptions<ReturnModel<TEntity, Entity>> & {
  ids?: Id[];
  onSuccess?: (
    data: (ApiHooksResp<ReturnModel<TEntity, Entity>> | undefined)[]
  ) => void;
} & CommonQueryOptions<TEntity, Entity, S, ErrorT>;

/* -----------------------
   Factory Options
   ----------------------- */

export type CrudFactoryOptions<
  TParams = Record<string, any>,
  Prefix = string
> = {
  defaultParams?: TParams & { entity: Prefix };
};

export type PrefetchOptions<TEntity, Entity> = {
  list?: OffsetCallOptions<ReturnModel<TEntity, Entity>[], false>;
  items?: Array<{
    id: Id;
    options?: SingleQueryOptions<TEntity, Entity, false>;
  }>;
  infiniteList?: CursorCallOptions<ReturnModel<TEntity, Entity>[], false>;
};
/* -----------------------
   Utility Functions
   ----------------------- */

const buildQueryKey = (
  ...parts: (string | number | undefined | null | unknown)[]
) => parts.filter(Boolean);

const getEmptyPaginationMeta = (
  meta: Partial<IPaginationMeta> = {}
): IPaginationMeta => ({
  next: undefined,
  totalRecords: 0,
  totalPages: 0,
  hasMore: false,
  limit: 10,
  ...meta,
});

const deepMerge = <T extends Record<string, any>>(
  base: T,
  overrides: Partial<T> = {}
): T => {
  const result = { ...base };

  for (const key in overrides) {
    const val = overrides[key];
    if (val === undefined) continue;

    if (typeof val !== "object" || val === null || Array.isArray(val)) {
      (result as any)[key] = val;
    } else {
      const baseVal = base[key];
      (result as any)[key] =
        typeof baseVal === "object" && baseVal !== null
          ? deepMerge(baseVal as any, val)
          : val;
    }
  }

  return result;
};

const filterSuspenseOptions = <T extends Record<string, any> | undefined>(
  opts: T | undefined,
  isSuspense: boolean
): Partial<Omit<T, "enabled" | "placeholderData">> => {
  if (!opts || !isSuspense) return opts || {};

  const { enabled, placeholderData, ...rest } = opts;
  return rest;
};

/* -----------------------
   CRUD Client Factory
   ----------------------- */

export function createCrudClient<TEntity, TParams = Record<string, any>>(
  model: Model<TEntity>,
  opts?: CrudFactoryOptions<TParams>
) {
  const queryClient = getQueryClient();

  const mergeParams = <T = Record<string, any>>(
    ...paramSets: (QueryParams<T> | undefined)[]
  ): QueryParams<T> => {
    const validParams = paramSets.filter(
      (p): p is QueryParams<T> => p !== undefined
    );
    return validParams.reduce(
      (result, params) => deepMerge(result, params),
      opts?.defaultParams || ({} as QueryParams<T>)
    );
  };

  // ---------- Raw API Methods ----------
  // ---------- Public API ----------
  /*********************************************PreFetch methods */
  const listRaw = async <Entity = TEntity>({
    params,
    options,
    onSuccess,
  }: {
    params?: Record<string, any>;
    options?: RequestOptions;
    onSuccess?: (
      data: IPaginatedReturnType<ReturnModel<TEntity, Entity>[]>
    ) => void;
  }): Promise<IPaginatedReturnType<ReturnModel<TEntity, Entity>[]>> => {
    const response = await model.list<
      IPaginatedReturnType<ReturnModel<TEntity, Entity>[]>
    >({
      path: options?.path,
      query: options?.query,
      requestOptions: {
        params: mergeParams(params),
        ...(options?.requestOptions || {}),
      },
    });

    if (response.data) {
      onSuccess?.(response.data);
    }

    return response.data as IPaginatedReturnType<
      ReturnModel<TEntity, Entity>[]
    >;
  };

  const getRaw = async <T = TEntity>({
    id,
    params,
    options,
    onSuccess,
  }: {
    id: Id;
    params?: Record<string, any>;
    options?: RequestOptions;
    onSuccess?: (data: T) => void;
  }) => {
    const response = await model.get<T>(`${id}`, {
      path: options?.path,
      query: options?.query,
      requestOptions: {
        ...(options?.requestOptions || {}),
        params: mergeParams(params, options?.requestOptions?.params),
      },
    });

    if (response.data) {
      onSuccess?.(response.data);
    }

    return response;
  };

  const createRaw = async <T = Partial<TEntity>, TVars = Partial<TEntity>>({
    payload,
    params,
    options,
    onSuccess,
  }: {
    payload?: TVars;
    params?: Record<string, any>;
    options?: RequestOptions;
    onSuccess?: (data: T) => void;
  }) => {
    const response = await model.create<T>(payload as Partial<TEntity>, {
      query: options?.query,
      path: options?.path,
      requestOptions: {
        ...(options?.requestOptions || {}),
        params: mergeParams(params, options?.requestOptions?.params),
      },
    });

    if (response.data) {
      onSuccess?.(response.data);
    }

    return response;
  };

  const updateRaw = async <T = Partial<TEntity>, TVars = Partial<TEntity>>({
    id,
    payload,
    params,
    options,
    onSuccess,
  }: {
    id: Id;
    payload: TVars;
    params?: Record<string, any>;
    options?: RequestOptions;
    onSuccess?: (data: T) => void;
  }) => {
    const response = await model.update<T>(
      `/${id}`,
      payload as Partial<TEntity>,
      {
        path: options?.path,
        query: options?.query,
        requestOptions: {
          ...(options?.requestOptions || {}),
          params: mergeParams(params, options?.requestOptions?.params),
        },
      }
    );

    if (response.data) {
      onSuccess?.(response.data);
    }

    return response;
  };

  const deleteRaw = async <T = Partial<TEntity>>({
    id,
    params,
    options,
    onSuccess,
  }: {
    id: Id;
    params?: Record<string, any>;
    options?: RequestOptions;
    onSuccess?: (data: T) => void;
  }) => {
    const response = await model.delete<T>(`/${id}`, {
      path: options?.path,
      query: options?.query,
      requestOptions: {
        ...(options?.requestOptions || {}),
        params: mergeParams(params, options?.requestOptions?.params),
      },
    });

    if (response.data) {
      onSuccess?.(response.data);
    }

    return response;
  };

  // ---------- Query Hook Factories ----------

  const createQueryHook = <S extends boolean>(suspense: S) =>
    suspense ? useSuspenseQuery : useQuery;

  const createQueriesHook = <S extends boolean>(suspense: S) =>
    suspense ? useSuspenseQueries : useQueries;

  const createInfiniteQueryHook = <S extends boolean>(suspense: S) =>
    suspense ? useSuspenseInfiniteQuery : useInfiniteQuery;

  // ---------- List Hooks ----------

  const useListEntities = <Entity = TEntity, S extends boolean = false>(
    callOptions?: OffsetCallOptions<ReturnModel<TEntity, Entity>[], S>,
    isSuspense: S = false as S
  ) => {
    const params = mergeParams(callOptions?.params) as OffsetPaginationParams;
    const { isEnabled = true, sort, sortBy } = params;
    const useHook = createQueryHook(isSuspense);

    return useHook({
      queryKey: buildQueryKey(
        params.entity,
        "list",
        params.limit,
        params.page,
        sort,
        sortBy,
        ...(callOptions?.queryKey || [])
      ),
      queryFn: async ({ signal }) => {
        const response = await listRaw<Entity>({
          params,
          options: {
            ...callOptions?.options,
            requestOptions: {
              ...(callOptions?.options?.requestOptions || {}),
              signal,
            },
          },
        });
        callOptions?.onSuccess?.(response);
        return response;
      },
      ...(isSuspense ? {} : { enabled: isEnabled }),
      ...filterSuspenseOptions(callOptions?.queryOptions, isSuspense),
    });
  };

  const useInfiniteListEntities = <Entity = TEntity, S extends boolean = false>(
    callOptions?: CursorCallOptions<ReturnModel<TEntity, Entity>[], S>,
    isSuspense: S = false as S
  ) => {
    const params = mergeParams(callOptions?.params) as CursorPaginationParams;
    const { isEnabled = true } = params;
    const useHook = createInfiniteQueryHook(isSuspense);

    const select = (data: InfiniteListData<ReturnModel<TEntity, Entity>[]>) => {
      const items = data.pages.flatMap((page) => page.data || []);
      const paginationMeta =
        data.pages.length > 0
          ? data.pages[data.pages.length - 1].pagination_meta
          : getEmptyPaginationMeta({ limit: params.limit });

      const result: ListReturnType<ReturnModel<TEntity, Entity>[]> = {
        pagination_meta: paginationMeta,
        data: items,
        pageParams: data.pageParams,
        pages: data.pages as any,
      };

      callOptions?.onSuccess?.(result);
      return result;
    };

    return useHook({
      queryKey: buildQueryKey(
        params.entity,
        "infinite-list",
        params.limit,
        params.cursor,
        params.sort,
        params.sortBy,
        ...(callOptions?.queryKey || [])
      ),
      queryFn: async ({ pageParam }) => {
        const cursorParams = pageParam ? { cursor: pageParam as string } : {};
        return await listRaw<Entity>({
          params: { ...params, ...cursorParams },
          options: callOptions?.options,
        });
      },
      getNextPageParam: (lastPage) =>
        lastPage.pagination_meta?.next || undefined,
      initialPageParam: params.cursor,
      select,
      ...(isSuspense ? {} : { enabled: isEnabled }),
      ...filterSuspenseOptions(callOptions?.infiniteOptions, isSuspense),
    });
  };

  // ---------- Single Entity Hooks ----------

  const useGetEntity = <Entity = TEntity, S extends boolean = false>(
    callOptions?: SingleQueryOptions<TEntity, Entity, S>,
    isSuspense: S = false as S
  ) => {
    const {
      isEnabled = true,
      sort,
      sortBy,
      ...params
    } = mergeParams(callOptions?.params);
    const { id } = { ...params, ...callOptions };
    const useHook = createQueryHook(isSuspense);
    const queryoptions = filterSuspenseOptions<
      SingleQueryOptions<TEntity, Entity, S>["queryOptions"]
    >(callOptions?.queryOptions, isSuspense);
    return useHook({
      queryKey: buildQueryKey(
        params.entity,
        "get",
        id,
        sort,
        sortBy,
        ...(callOptions?.queryKey || [])
      ),
      queryFn: async ({ signal }) => {
        if (!id) throw new Error("ID is required for useGet");

        const response = await getRaw<ReturnModel<TEntity, Entity>>({
          id: id as Id,
          params,
          options: {
            ...callOptions?.options,
            requestOptions: {
              ...(callOptions?.options?.requestOptions || {}),
              signal,
            },
          },
        });
        callOptions?.onSuccess?.(response);
        return response;
      },
      ...(isSuspense ? {} : { enabled: isEnabled && !!id }),
      ...queryoptions,
    });
  };

  const useGetEntities = <Entity = TEntity, S extends boolean = false>(
    callOptions?: MultiQueryOptions<TEntity, Entity, S>,
    isSuspense: S = false as S
  ) => {
    const params = mergeParams(callOptions?.params);
    const { ids = [], queryKey = [], queryOptions = {} } = callOptions || {};
    const queryoptions = filterSuspenseOptions<
      MultiQueryOptions<TEntity, Entity, S>["queryOptions"]
    >(queryOptions, isSuspense);

    const useHook = createQueriesHook(isSuspense);

    return useHook({
      queries: (ids || [])?.map((id) => {
        return {
          queryKey: buildQueryKey(params.entity, "get", id, ...queryKey),
          queryFn: async () => {
            if (id) {
              const res = await getRaw<ReturnModel<TEntity, Entity>>({
                id,
                params,
                options: {
                  ...callOptions?.options,
                  requestOptions: {
                    ...(callOptions?.options?.requestOptions || {}),
                    // signal,
                  },
                },
              });
              // Cast the response to the expected type
              // return res.data as IApiResponse<UnionIfBPresent<TEntity, Entity>>;
              return res;
            }
          },

          retry: false,
          ...(isSuspense ? {} : { enabled: !!id }),
          ...queryoptions,
        };
      }),
      combine: (results) => {
        const result = {
          data: results.map((r) => r.data),
          isLoading: results.some((r) => r.isLoading),
          isError: results.some((r) => r.isError),
          errors: results.map((r) => r.error),
        };
        callOptions?.onSuccess?.(result.data);
        return result;
      },
    });
  };

  // ---------- Mutation Hooks ----------

  const useCreate = <Entity = TEntity, TVars = Partial<TEntity>>(
    callOptions?: MutationCallOptions<ReturnModel<TEntity, Entity>, TVars>
  ) =>
    useMutation({
      mutationFn: (payload: TVars) =>
        createRaw({
          payload,
          params: callOptions?.params,
          options: callOptions?.options,
          onSuccess: callOptions?.onSuccess,
        }),
      ...callOptions?.mutationOptions,
    });

  const useUpdate = <Entity = TEntity, TVars = Partial<TEntity>>(
    callOptions?: MutationCallOptions<
      { id: Id; data: TEntity & IPartialIfExist<Entity> },
      { id: Id; data: TVars }
    >
  ) =>
    useMutation({
      mutationFn: ({ id, data }: { id: Id; data: TVars }) =>
        updateRaw({
          id,
          payload: data,
          params: callOptions?.params,
          options: callOptions?.options,
          onSuccess: callOptions?.onSuccess,
        }),
      ...callOptions?.mutationOptions,
    });

  const useDelete = (callOptions?: MutationCallOptions<Id, Id>) =>
    useMutation({
      mutationFn: (id: Id) =>
        deleteRaw({
          id,
          params: callOptions?.params,
          options: callOptions?.options,
          onSuccess: callOptions?.onSuccess,
        }),
      ...callOptions?.mutationOptions,
    });

  // ---------- Cache Utilities ----------

  const updateCache = (
    id: Id,
    updates: Partial<TEntity>,
    queryKey?: QueryKey
  ) => {
    const key = buildQueryKey(opts?.defaultParams?.entity, id, queryKey);
    queryClient.setQueryData(key, (old: TEntity | undefined) =>
      old ? { ...old, ...updates } : undefined
    );
  };

  const getUrl = (endpoint?: string) =>
    `${model.fullURL}${endpoint ? `/${endpoint}` : ""}`;

  const useSuspenseList = <Entity = TEntity>(
    opts?: OffsetCallOptions<ReturnModel<TEntity, Entity>[], true>
  ) => useListEntities(opts, true);
  const useList = <Entity = TEntity>(
    opts?: OffsetCallOptions<ReturnModel<TEntity, Entity>[]>
  ) => useListEntities(opts);

  const useSuspenseInfiniteList = <Entity = TEntity>(
    opts?: CursorCallOptions<ReturnModel<TEntity, Entity>[], true>
  ) => useInfiniteListEntities(opts, true);
  const useInfiniteList = <Entity = TEntity>(
    opts?: CursorCallOptions<ReturnModel<TEntity, Entity>[]>
  ) => useInfiniteListEntities(opts);

  const useSuspenseGet = <Entity = TEntity>(
    opts?: SingleQueryOptions<TEntity, Entity, true>
  ) => useGetEntity(opts, true);
  const useGet = <Entity = TEntity>(
    opts?: SingleQueryOptions<TEntity, Entity>
  ) => useGetEntity(opts);

  const useSuspenseGetMany = <Entity = TEntity>(
    opts?: MultiQueryOptions<TEntity, Entity, true>
  ) => useGetEntities(opts, true);
  const useGetMany = <Entity = TEntity>(
    opts?: MultiQueryOptions<TEntity, Entity>
  ) => useGetEntities(opts, true);

  /* -----------------------
   Prefetch Methods
   ----------------------- */

  // Add these methods to the return object at the end of the factory function

  // ---------- Prefetch Methods ----------

  const prefetchList = async <Entity = TEntity>(
    callOptions?: OffsetCallOptions<ReturnModel<TEntity, Entity>[], false>
  ) => {
    const params = mergeParams(callOptions?.params) as OffsetPaginationParams;

    await queryClient.prefetchQuery({
      queryKey: buildQueryKey(
        params.entity,
        "list",
        params.limit,
        params.page,
        params.sort,
        params.sortBy,
        ...(callOptions?.queryKey || [])
      ),
      queryFn: async ({ signal }) => {
        const response = await listRaw<Entity>({
          params,
          options: {
            ...callOptions?.options,
            requestOptions: { signal },
          },
        });
        callOptions?.onSuccess?.(response);
        return response;
      },
      ...callOptions?.queryOptions,
    });
  };

  const prefetchGet = async <Entity = TEntity>(
    callOptions: SingleQueryOptions<TEntity, Entity, false> & { id: Id }
  ) => {
    const params = mergeParams(callOptions?.params);

    await queryClient.prefetchQuery({
      queryKey: buildQueryKey(
        params.entity,
        "get",
        callOptions.id,
        params.sort,
        params.sortBy,
        ...(callOptions.queryKey || [])
      ),
      queryFn: async ({ signal }) => {
        const response = await getRaw<ReturnModel<TEntity, Entity>>({
          id: callOptions.id,
          params,
          options: {
            ...callOptions.options,
            requestOptions: { signal },
          },
        });
        callOptions.onSuccess?.(response);
        return response;
      },
      ...callOptions.queryOptions,
    });
  };
  const prefetchInfiniteList = async <Entity = TEntity>(
    callOptions?: CursorCallOptions<ReturnModel<TEntity, Entity>[], false>
  ) => {
    const params = mergeParams(callOptions?.params) as CursorPaginationParams;

    await queryClient.prefetchInfiniteQuery({
      queryKey: buildQueryKey(
        params.entity,
        "infinite-list",
        params.limit,
        params.cursor,
        params.sort,
        params.sortBy,

        ...(callOptions?.queryKey || [])
      ),
      queryFn: async ({ pageParam }) => {
        const cursorParams = pageParam ? { cursor: pageParam as string } : {};
        return await listRaw<Entity>({
          params: { ...params, ...cursorParams },
          options: callOptions?.options,
        });
      },
      initialPageParam: params.cursor,
      ...callOptions?.infiniteOptions,
    });
  };

  const prefetchGetMany = async <Entity = TEntity>(
    callOptions: MultiQueryOptions<TEntity, Entity, false> & { ids: Id[] }
  ) => {
    const params = mergeParams(callOptions.params);
    const { ids = [] } = callOptions;

    // Prefetch each individual entity
    const prefetchPromises = ids.map((id) =>
      queryClient.prefetchQuery({
        queryKey: buildQueryKey(
          params.entity,
          "get",
          id,
          ...(callOptions.queryKey || [])
        ),
        queryFn: async ({ signal }) => {
          const response = await getRaw<ReturnModel<TEntity, Entity>>({
            id,
            params,
            options: {
              ...callOptions.options,
              requestOptions: { signal },
            },
          });
          return response;
        },
        ...callOptions.queryOptions,
      })
    );

    await Promise.all(prefetchPromises);
  };

  const prefetchAll = async <Entity = TEntity>(options?: {
    list?: OffsetCallOptions<ReturnModel<TEntity, Entity>[], false>;
    items?: Array<{
      id: Id;
      options?: SingleQueryOptions<TEntity, Entity, false>;
    }>;
    infiniteList?: CursorCallOptions<ReturnModel<TEntity, Entity>[], false>;
  }) => {
    const promises = [];

    if (options?.list) {
      promises.push(prefetchList(options.list));
    }

    if (options?.items) {
      promises.push(
        ...options.items.map((item) =>
          prefetchGet({ ...item.options, id: item.id })
        )
      );
    }

    if (options?.infiniteList) {
      promises.push(prefetchInfiniteList(options.infiniteList));
    }

    await Promise.all(promises);
  };
  return {
    // Raw methods
    listRaw,
    getRaw,
    createRaw,
    updateRaw,
    deleteRaw,

    // Query hooks
    useList,
    useInfiniteList,
    useGet,
    useGetMany,

    // Suspense variants
    useSuspenseList,
    useSuspenseInfiniteList,
    useSuspenseGet,
    useSuspenseGetMany,

    // Mutation hooks
    useCreate,
    useUpdate,
    useDelete,

    // Utilities
    updateCache,
    getUrl,

    // Prefetch
    prefetchList,
    prefetchGet,
    prefetchGetMany,
    prefetchInfiniteList,

    // Utility prefetch methods
    prefetchAll,
  };
}
