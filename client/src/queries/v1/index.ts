/* eslint-disable @typescript-eslint/no-explicit-any */
/* =============================
   Enhanced CRUD Client Factory
   ============================= */

import { getQueryClient } from "@/get-query-client";
import { withErrorHandler } from "@/lib";
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
  MutateOptions,
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
const filterOperatorList = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "like",
  "ilike",
  "in",
  "notIn",
  "isNull",
  "isNotNull",
  "between",
  "notBetween",
] as const;

export const FilterOperatorEnum = Object.fromEntries(
  filterOperatorList.map((op) => [op, op])
) as { [K in (typeof filterOperatorList)[number]]: K };
type ExtractHookParams<T> = T extends (...args: infer P) => any ? P : never;

// Extract the first parameter type from a hook function
type ExtractHookOptions<T> = T extends (...args: any) => any
  ? ExtractHookParams<T>[0]
  : never;

export type Id = string | number | undefined;
export type SortOrder = "asc" | "desc";
export type DefaultError = IResponseError<null>;
export type ReturnModel<TEntity, Entity> = ReturnModelType<TEntity, Entity>;
export type ApiHooksResp<T> = IApiResponseHooks<T>;

export type BaseParams = {
  entity?: string;
  [key: string]: any;
};
/* -----------------------
   Parameter Types
   ----------------------- */

//  new Types
export type SortDirection = "asc" | "desc";
export type IPaginationModes = "cursor" | "offset";

// Filter operators
export type FilterOperator =
  (typeof FilterOperatorEnum)[keyof typeof FilterOperatorEnum];

export interface FilterCondition<T = Record<string, any>> {
  column: keyof T;
  operator: FilterOperator;
  value: any;
}

export interface SortConfig<T = Record<string, any>> {
  column: keyof T;
  direction: SortDirection;
  nulls?: "first" | "last";
}

export interface SearchConfig<T = Record<string, any>> {
  columns: (keyof T)[];
  term: string;
  mode?: "any" | "all" | "phrase";
}

// Pagination base config
export type BasePaginationConfig<T = Record<string, any>> = BaseParams & {
  filters?: FilterCondition<T>[] | null;
  search?: SearchConfig<T> | null;
  sorts?: SortConfig<T>[] | null;
  includeTotal?: boolean;
};

// Offset pagination config
export type OffsetPaginationConfig<T = Record<string, any>> =
  BasePaginationConfig<T> & {
    page?: number;
    limit?: number;
  };

// Cursor pagination config
export type CursorPaginationConfig<T = Record<string, any>> =
  BasePaginationConfig<T> & {
    cursor?: string | number | null;
    limit?: number;
    // cursorColumn: keyof T;
    cursorDirection?: "forward" | "backward";
  };
export type QueryParams<T = Record<string, any>> = BasePaginationConfig<T> &
  (
    | (CursorPaginationConfig<T> & { mode: "cursor" })
    | (OffsetPaginationConfig<T> & { mode: "offset" })
    | { mode?: undefined }
  );
/* -----------------------
Request Options
----------------------- */

export type RequestOptions<T = Record<string, any>> = {
  query?: QueryParams<T>; // Make query match params type
  path?: string;
  requestOptions?: Partial<IRequestOptions>;
};

export type CallOptions<T = Record<string, any>> = {
  // params?: QueryParams<T>;
  options?: RequestOptions<T>; // Use generic RequestOptions
  queryKey?: QueryKey;
  isEnabled?: boolean;
} & {
  params?: Partial<Record<keyof T, any>>;
};

/* -----------------------
   Response Types
   ----------------------- */

export type ListData<T> = { items: T; pagination_meta: IPaginationMeta };
export type InfiniteListData<T> = InfiniteData<ListData<T>, unknown>;

export type ListReturnType<T> = {
  pagination_meta: IPaginationMeta | undefined;
  items: T;
  pageParams: unknown[];
  pages: { items: T; pagination_meta: IPaginationMeta }[];
};

/* -----------------------
   Query Option Types
   ----------------------- */

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
      // InfiniteListData<T>,
      ListReturnType<T>,
      QueryKey
    >
  : UseInfiniteQueryOptions<
      ApiHooksResp<T>,
      ErrorT,
      // InfiniteListData<T>,,
      ListReturnType<T>,
      QueryKey
    >;

/* -----------------------
   Operation Options
   ----------------------- */

type CommonListOptions<T, S extends boolean = false, ErrorT = DefaultError> = {
  options?: RequestOptions<T>; // Use generic RequestOptions
  queryOptions?: Omit<QueryOptions<T[], S, ErrorT>, "queryKey">;
  queryKey?: QueryKey;
  isEnabled?: boolean;
};

export type ListCallOptions<
  T,
  S extends boolean = false,
  ErrorT = DefaultError
> = CommonListOptions<T, S, ErrorT> & {
  infiniteOptions?: Partial<
    Omit<InfiniteQueryOptions<T[], S, ErrorT>, "queryKey">
  >;
  getNextPageParam?: InfiniteQueryOptions<T[], S, ErrorT>["getNextPageParam"];
  onSuccess?: (data: ListReturnType<T[]>) => void;
};

export type CursorCallOptions<
  T,
  S extends boolean = false,
  ErrorT = DefaultError
> = {
  params?: CursorPaginationConfig<T>;
  onSuccess?: (data: ListReturnType<T[]>) => void;
} & ListCallOptions<T, S, ErrorT>;

export type IListCallOptions<
  T,
  S extends boolean = false,
  Mode extends IPaginationModes | undefined = undefined,
  ErrorT = DefaultError
> = CommonListOptions<T, S, ErrorT> & {
  mode?: Mode;

  params?: Mode extends "offset"
    ? OffsetPaginationConfig<T>
    : Mode extends "cursor"
    ? CursorPaginationConfig<T>
    : QueryParams<T>;
  onSuccess?: (data: IPaginatedReturnType<T[]>) => void;
};

/* -----------------------
   Enhanced Mutation Types
   ----------------------- */

export type MutationCallOptions<
  TData = any,
  TVars = any,
  ErrorT = DefaultError
> = {
  params?: QueryParams<TData>;
  options?: RequestOptions<TData>; // Use generic RequestOptions
  mutationOptions?: UseMutationOptions<IApiResponse<TData>, ErrorT, TVars>;
  onSuccess?: (data: TData) => void;
  invalidateQueries?: {
    queryKey: QueryKey;
    exact?: boolean;
  }[];
  refetchQueries?: {
    queryKey: QueryKey;
    exact?: boolean;
  }[];
  optimisticUpdate?: {
    queryKey: QueryKey;
    updateFn: (oldData: any, newData: TVars) => any;
  };
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

// export type PrefetchOptions<Mode extends IPaginationModes, TEntity, Entity> = {
//   list?: IListCallOptions<ReturnModel<TEntity, Entity>[], false, Mode>;
//   items?: Array<{
//     id: Id;
//     options?: SingleQueryOptions<TEntity, Entity, false>;
//   }>;
//   infiniteList?: CursorCallOptions<ReturnModel<TEntity, Entity>, false>;
// };

/* -----------------------
   Enhanced Utility Functions
   ----------------------- */

const buildQueryKey = (
  ...parts: (string | number | undefined | null | unknown)[]
) => parts.filter((a) => a != null);

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

// Enhanced merging function specifically for RequestOptions
const mergeRequestOptions = (
  base?: Partial<IRequestOptions>,
  overrides?: Partial<IRequestOptions>
): Partial<IRequestOptions> => {
  if (!base && !overrides) return {};
  if (!base) return overrides || {};
  if (!overrides) return base;

  return {
    ...base,
    ...overrides,
    params: deepMerge(base.params || {}, overrides.params || {}),
    headers: deepMerge(base.headers || {}, overrides.headers || {}),
  };
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
      (result, params) => deepMerge(result || {}, params || {}),
      opts?.defaultParams || {}
    ) as QueryParams<T>;
  };

  // ---------- Enhanced Raw API Methods ----------

  const listRaw = async <T = TEntity>({
    params,
    onSuccess,
    ...options
  }: RequestOptions<ReturnModel<TEntity, T>> & {
    params?: QueryParams<ReturnModel<TEntity, T>>;
    onSuccess?: (data: IPaginatedReturnType<ReturnModel<TEntity, T>[]>) => void;
  }): Promise<IPaginatedReturnType<ReturnModel<TEntity, T>[]>> => {
    const { isEnabled, sorts, search, filters, ...mergedParams } =
      mergeParams<ReturnModel<TEntity, T>>(params);
    const sortKeys = sorts && sorts.length ? JSON.stringify(sorts) : null;
    const filterKeys =
      filters && filters.length ? JSON.stringify(filters) : null;
    const searchKeys =
      search && search?.columns?.length ? JSON.stringify(search) : null;
    const mergedRequestOptions = mergeRequestOptions(
      {
        params: {
          ...mergedParams,
          sorts: sortKeys,
          filters: filterKeys,
          search: searchKeys,
        },
      },
      options?.requestOptions
    );

    const response = await model.list<
      IPaginatedReturnType<ReturnModel<TEntity, T>[]>
    >({
      path: options?.path,
      query: options?.query, // Now query type matches params type
      requestOptions: mergedRequestOptions,
    });

    if (response.data) {
      onSuccess?.(response.data);
    }

    return response.data as IPaginatedReturnType<ReturnModel<TEntity, T>[]>;
  };

  const getRaw = async <T = TEntity>({
    id,
    params,

    onSuccess,
    ...rest
  }: RequestOptions<T> & {
    id: Id;
    params?: QueryParams<T>;
    // options?: RequestOptions<T>; // Generic options
    onSuccess?: (data: T) => void;
  }) => {
    const { isEnabled, sorts, filters, search, ...mergedParams } =
      mergeParams<T>(params, rest?.requestOptions?.params);
    const sortKeys = sorts && sorts.length ? JSON.stringify(sorts) : null;
    const filterKeys =
      filters && filters.length ? JSON.stringify(filters) : null;
    const searchKeys =
      search && search?.columns?.length ? JSON.stringify(search) : null;
    const mergedRequestOptions = mergeRequestOptions(
      {
        params: {
          ...mergedParams,
          sorts: sortKeys,
          filters: filterKeys,
          search: searchKeys,
        },
      },
      rest?.requestOptions
    );

    const response = await model.get<T>(id, {
      path: rest?.path,
      query: rest?.query, // Now query type matches params type
      requestOptions: mergedRequestOptions,
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
    params?: QueryParams<T>;
    options?: RequestOptions<T>; // Generic options
    onSuccess?: (data: T) => void;
  }) => {
    const { isEnabled, ...mergedParams } = mergeParams<T>(
      params,
      options?.requestOptions?.params
    );
    const mergedRequestOptions = mergeRequestOptions(
      { params: mergedParams },
      options?.requestOptions
    );

    const response = await model.create<T>(payload as Partial<TEntity>, {
      query: options?.query, // Now query type matches params type
      path: options?.path,
      requestOptions: mergedRequestOptions,
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
    params?: QueryParams<T>;
    options?: RequestOptions<T>; // Generic options
    onSuccess?: (data: T) => void;
  }) => {
    const { isEnabled, ...mergedParams } = mergeParams<T>(
      params,
      options?.requestOptions?.params
    );
    const mergedRequestOptions = mergeRequestOptions(
      { params: mergedParams },
      options?.requestOptions
    );

    const response = await model.update<T>(
      id || "",
      payload as Partial<TEntity>,
      {
        path: options?.path,
        query: options?.query, // Now query type matches params type
        requestOptions: mergedRequestOptions,
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
    params?: QueryParams<T>;
    options?: RequestOptions<T>; // Generic options
    onSuccess?: (data: T) => void;
  }) => {
    const { isEnabled, ...mergedParams } = mergeParams<T>(
      params,
      options?.requestOptions?.params
    );
    const mergedRequestOptions = mergeRequestOptions(
      { params: mergedParams },
      options?.requestOptions
    );
    const response = await model.delete<T>(id, {
      path: options?.path,
      query: options?.query, // Now query type matches params type
      requestOptions: mergedRequestOptions,
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

  const useListEntities = <
    Entity = TEntity,
    S extends boolean = false,
    Mode extends IPaginationModes | undefined = undefined
  >(
    callOptions?: IListCallOptions<ReturnModel<TEntity, Entity>, S, Mode>,
    isSuspense: S = false as S
  ) => {
    const params = mergeParams(callOptions?.params) as OffsetPaginationConfig<
      ReturnModel<TEntity, Entity>
    >;
    const sortKeys =
      params.sorts && params.sorts.length ? JSON.stringify(params.sorts) : null;
    const filterKeys =
      params.filters && params.filters.length
        ? JSON.stringify(params.filters)
        : null;
    const searchKeys =
      params.search && params.search?.columns?.length
        ? JSON.stringify(params.search)
        : null;
    const { isEnabled = true } = callOptions || {};
    const useHook = createQueryHook(isSuspense);

    return useHook({
      queryKey: buildQueryKey(
        params.entity,
        "list",
        params.limit,
        params.page,
        ...(callOptions?.queryKey || []),
        sortKeys,
        filterKeys,
        searchKeys
      ),
      queryFn: async ({ signal }) => {
        const response = await listRaw<Entity>({
          params: { ...params, mode: "offset" },
          ...callOptions?.options,
          requestOptions: {
            ...(callOptions?.options?.requestOptions || {}),
            signal,
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
    callOptions?: CursorCallOptions<ReturnModel<TEntity, Entity>, S>,
    isSuspense: S = false as S
  ) => {
    const params = mergeParams(callOptions?.params) as CursorPaginationConfig<
      ReturnModel<TEntity, Entity>
    >;
    const { isEnabled = true } = callOptions || {};
    const sortKeys =
      params.sorts && params.sorts.length ? JSON.stringify(params.sorts) : null;
    const filterKeys =
      params.filters && params.filters.length
        ? JSON.stringify(params.filters)
        : null;
    const searchKeys =
      params.search && params.search?.columns?.length
        ? JSON.stringify(params.search)
        : null;
    const useHook = createInfiniteQueryHook(isSuspense);

    const select = (data: InfiniteListData<ReturnModel<TEntity, Entity>[]>) => {
      const items = data.pages.flatMap((page) => page.items || []);
      const paginationMeta =
        data.pages.length > 0
          ? data.pages[data.pages.length - 1].pagination_meta
          : getEmptyPaginationMeta({ limit: params.limit });

      const result: ListReturnType<ReturnModel<TEntity, Entity>[]> = {
        pagination_meta: paginationMeta,
        items,
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
        ...(callOptions?.queryKey || []),
        sortKeys,
        filterKeys,
        searchKeys
      ),
      queryFn: async ({ pageParam }) => {
        const cursorParams = pageParam ? { cursor: pageParam as string } : {};
        return await listRaw<Entity>({
          params: { ...params, ...cursorParams, mode: "cursor" },
          ...(callOptions?.options || {}),
        });
      },
      getNextPageParam: (lastPage) =>
        lastPage.pagination_meta?.next || undefined,
      initialPageParam: params.cursor,
      ...(isSuspense ? {} : { enabled: isEnabled }),
      ...filterSuspenseOptions(callOptions?.infiniteOptions, isSuspense),
      select: callOptions?.infiniteOptions?.select || select,
    });
  };

  // ---------- Single Entity Hooks ----------

  const useGetEntity = <Entity = TEntity, S extends boolean = false>(
    callOptions?: SingleQueryOptions<TEntity, Entity, S>,
    isSuspense: S = false as S
  ) => {
    const params = mergeParams(callOptions?.params) as QueryParams<
      ReturnModel<TEntity, Entity>
    >;
    const { isEnabled = true } = callOptions || {};

    const { entity } = params;
    const sortKeys =
      params.sorts && params.sorts.length ? JSON.stringify(params.sorts) : null;
    const filterKeys =
      params.filters && params.filters.length
        ? JSON.stringify(params.filters)
        : null;
    const searchKeys =
      params.search && params.search?.columns?.length
        ? JSON.stringify(params.search)
        : null;
    const { id } = { ...params, ...callOptions };
    const useHook = createQueryHook(isSuspense);
    const queryoptions = filterSuspenseOptions<
      SingleQueryOptions<TEntity, Entity, S>["queryOptions"]
    >(callOptions?.queryOptions, isSuspense);
    return useHook({
      queryKey: buildQueryKey(
        entity,
        "get",
        id,

        ...(callOptions?.queryKey || []),
        sortKeys,
        filterKeys,
        searchKeys
      ),
      queryFn: async ({ signal }) => {
        // if (id == null) throw new Error("ID is required for useGet");

        const response = await getRaw<ReturnModel<TEntity, Entity>>({
          id: (id as Id) || "",
          params: { ...params },
          ...(callOptions?.options || {}),
          requestOptions: {
            ...(callOptions?.options?.requestOptions || {}),
            signal,
          },
        });
        callOptions?.onSuccess?.(response);
        return response;
      },
      ...(isSuspense ? {} : { enabled: isEnabled }),
      ...(queryoptions || {}),
    });
  };

  const useGetEntities = <Entity = TEntity, S extends boolean = false>(
    callOptions?: MultiQueryOptions<TEntity, Entity, S>,
    isSuspense: S = false as S
  ) => {
    const params = mergeParams(callOptions?.params) as QueryParams<
      ReturnModel<TEntity, Entity>
    >;
    const {
      ids = [],
      queryKey = [],
      queryOptions = {},
      isEnabled = true,
    } = callOptions || {};
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
                ...(callOptions?.options || {}),
                requestOptions: {
                  ...(callOptions?.options?.requestOptions || {}),
                },
              });
              return res;
            }
          },

          retry: false,
          ...(isSuspense ? {} : { enabled: isEnabled }),
          ...(queryoptions || {}),
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

  // ---------- Enhanced Mutation Hooks with Cache Management ----------

  const useCreate = <Entity = TEntity, TVars = Partial<TEntity>>(
    callOptions?: MutationCallOptions<ReturnModel<TEntity, Entity>, TVars>
  ) => {
    const params = mergeParams(callOptions?.params) as QueryParams<
      ReturnModel<TEntity, Entity>
    >;
    const mutate = useMutation({
      mutationFn: (payload: TVars) =>
        createRaw({
          payload,
          params: callOptions?.params,
          options: callOptions?.options,
          onSuccess: callOptions?.onSuccess,
        }),
      onSuccess: (data, variables, mutationResult, context) => {
        if (data.data) {
          callOptions?.onSuccess?.(data.data);
        }

        if (callOptions?.invalidateQueries) {
          callOptions.invalidateQueries.forEach(({ queryKey, exact }) => {
            queryClient.invalidateQueries({
              queryKey: buildQueryKey(params.entity, ...(queryKey || [])),
              exact,
            });
          });
        }

        if (callOptions?.refetchQueries) {
          callOptions.refetchQueries.forEach(({ queryKey, exact }) => {
            queryClient.refetchQueries({
              queryKey: [params.entity, ...(queryKey || [])],
              exact,
            });
          });
        }

        callOptions?.mutationOptions?.onSuccess?.(
          data,
          variables,
          mutationResult,
          context
        );
      },
      onMutate: async (variables, ctx) => {
        if (callOptions?.optimisticUpdate) {
          const { queryKey, updateFn } = callOptions.optimisticUpdate;
          await queryClient.cancelQueries({ queryKey });

          const previousData = queryClient.getQueryData(queryKey);
          queryClient.setQueryData(queryKey, (old: any) =>
            updateFn(old, variables)
          );

          return { previousData };
        }

        return callOptions?.mutationOptions?.onMutate?.(variables, ctx);
      },
      onError: (error, variables, mutationResult, context) => {
        if (context && (context as any).previousData) {
          const { queryKey } = callOptions?.optimisticUpdate!;
          queryClient.setQueryData(queryKey, (context as any).previousData);
        }

        callOptions?.mutationOptions?.onError?.(
          error,
          variables,
          mutationResult,
          context
        );
      },
      ...callOptions?.mutationOptions,
    });
    const handleCreate = withErrorHandler(
      async (
        variables: TVars,
        options?:
          | MutateOptions<
              IApiResponse<ReturnModelType<TEntity, Entity>>,
              DefaultError,
              TVars,
              unknown
            >
          | undefined
      ) => {
        const res = await mutate.mutateAsync(variables, options);

        return res;
      }
    );

    return { ...mutate, handleCreate };
  };

  const useUpdate = <Entity = TEntity, TVars = Partial<TEntity>>(
    callOptions?: MutationCallOptions<
      { id: Id; data: TEntity & IPartialIfExist<Entity> },
      { id: Id; data: TVars }
    >
  ) => {
    const mutate = useMutation({
      mutationFn: ({ id, data }: { id: Id; data: TVars }) =>
        updateRaw({
          id,
          payload: data,
          params: callOptions?.params,
          options: callOptions?.options,
          onSuccess: callOptions?.onSuccess,
        }),
      onSuccess: (data, variables, mutationResult, context) => {
        if (data.data) {
          callOptions?.onSuccess?.(data.data);
        }

        if (variables?.id) {
          const entityKey = buildQueryKey(
            opts?.defaultParams?.entity,
            variables.id
          );
          queryClient.setQueryData(entityKey, (old: any) => {
            if (old && data.data) {
              return { ...old, ...data.data };
            }
            return old;
          });
        }

        if (callOptions?.invalidateQueries) {
          callOptions.invalidateQueries.forEach(({ queryKey, exact }) => {
            queryClient.invalidateQueries({ queryKey, exact });
          });
        }

        callOptions?.mutationOptions?.onSuccess?.(
          data,
          variables,
          mutationResult,
          context
        );
      },
      ...callOptions?.mutationOptions,
    });

    const handleUpdate = withErrorHandler(
      async (
        variables: {
          id: Id;
          data: TVars;
        },
        options?:
          | MutateOptions<
              IApiResponse<{
                id: Id;
                data: TEntity & IPartialIfExist<Entity>;
              }>,
              DefaultError,
              {
                id: Id;
                data: TVars;
              },
              unknown
            >
          | undefined
      ) => {
        const res = await mutate.mutateAsync(variables, options);

        return res;
      }
    );
    return { ...mutate, handleUpdate };
  };

  const useDelete = <Entity = TEntity>(
    callOptions?: MutationCallOptions<Entity, Id>
  ) => {
    const mutate = useMutation({
      mutationFn: (id: Id) =>
        deleteRaw({
          id,
          params: callOptions?.params,
          options: callOptions?.options,
          onSuccess: callOptions?.onSuccess,
        }),
      onSuccess: (data, id, mutationResult, context) => {
        if (data.data) {
          callOptions?.onSuccess?.(data.data);
        }

        const entityKey = buildQueryKey(opts?.defaultParams?.entity, id);
        queryClient.removeQueries({ queryKey: entityKey, exact: true });

        const listKey = buildQueryKey(opts?.defaultParams?.entity, "list");
        queryClient.invalidateQueries({
          queryKey: listKey,
          refetchType: "active",
        });

        callOptions?.mutationOptions?.onSuccess?.(
          data,
          id,
          mutationResult,
          context
        );
      },
      ...callOptions?.mutationOptions,
    });
    const handleDelete = withErrorHandler(
      async (data?: {
        id?: Id;
        options?: MutateOptions<
          ApiHooksResp<Entity>,
          DefaultError,
          Id,
          unknown
        >;
      }) => {
        const res = await mutate.mutateAsync(data?.id, data?.options);

        return res;
      }
    );

    return { ...mutate, handleDelete };
  };

  // ---------- Enhanced Cache Utilities ----------

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

  const invalidateCache = (queryKey?: QueryKey) => {
    const baseKey = opts?.defaultParams?.entity
      ? buildQueryKey(opts.defaultParams.entity)
      : [];

    const fullKey = queryKey ? [...baseKey, ...queryKey] : baseKey;
    return queryClient.invalidateQueries({ queryKey: fullKey });
  };

  const getUrl = (endpoint?: string) =>
    `${model.fullURL}${endpoint ? `/${endpoint}` : ""}`;

  // ---------- Enhanced Prefetch Methods ----------

  const prefetchList = <Entity = TEntity>(
    callOptions?: IListCallOptions<ReturnModel<TEntity, Entity>, false>
  ) => {
    const params = mergeParams(callOptions?.params) as OffsetPaginationConfig<
      ReturnModel<TEntity, Entity>
    >;
    const sortKeys =
      params.sorts && params.sorts.length ? JSON.stringify(params.sorts) : null;
    const filterKeys =
      params.filters && params.filters.length
        ? JSON.stringify(params.filters)
        : null;
    const searchKeys =
      params.search && params.search?.columns?.length
        ? JSON.stringify(params.search)
        : null;
    queryClient.prefetchQuery({
      queryKey: buildQueryKey(
        params.entity,
        "list",
        params.limit,
        params.page,

        ...(callOptions?.queryKey || []),
        sortKeys,
        filterKeys,
        searchKeys
      ),
      queryFn: async ({ signal }) => {
        const response = await listRaw<Entity>({
          params: { ...params, mode: "offset" },
          ...(callOptions?.options || {}),
          requestOptions: {
            ...(callOptions?.options?.requestOptions || {}),
            signal,
          },
        });
        callOptions?.onSuccess?.(response);
        return response;
      },
      ...(callOptions?.queryOptions || {}),
    });
  };

  const prefetchGet = <Entity = TEntity>(
    callOptions: SingleQueryOptions<TEntity, Entity, false> & { id?: Id }
  ) => {
    const params = mergeParams(callOptions?.params) as QueryParams<
      ReturnModel<TEntity, Entity>
    >;
    const sortKeys =
      params.sorts && params.sorts.length ? JSON.stringify(params.sorts) : null;
    const filterKeys =
      params.filters && params.filters.length
        ? JSON.stringify(params.filters)
        : null;
    const searchKeys =
      params.search && params.search?.columns?.length
        ? JSON.stringify(params.search)
        : null;
    queryClient.prefetchQuery({
      queryKey: buildQueryKey(
        params.entity,
        "get",
        callOptions.id,

        ...(callOptions.queryKey || []),
        sortKeys,
        filterKeys,
        searchKeys
      ),
      queryFn: async ({ signal }) => {
        const response = await getRaw<ReturnModel<TEntity, Entity>>({
          id: callOptions.id as Id,
          params,
          ...(callOptions?.options || {}),
          requestOptions: {
            ...(callOptions?.options?.requestOptions || {}),
            signal,
          },
        });
        callOptions.onSuccess?.(response);
        return response;
      },
      ...(callOptions.queryOptions || {}),
    });
  };

  const prefetchInfiniteList = <Entity = TEntity>(
    callOptions?: CursorCallOptions<ReturnModel<TEntity, Entity>, false>
  ) => {
    const params = mergeParams(callOptions?.params) as CursorPaginationConfig<
      ReturnModel<TEntity, Entity>
    >;
    const sortKeys =
      params.sorts && params.sorts.length ? JSON.stringify(params.sorts) : null;
    const filterKeys =
      params.filters && params.filters.length
        ? JSON.stringify(params.filters)
        : null;
    const searchKeys =
      params.search && params.search?.columns?.length
        ? JSON.stringify(params.search)
        : null;
    queryClient.prefetchInfiniteQuery({
      queryKey: buildQueryKey(
        params.entity,
        "infinite-list",
        params.limit,
        params.cursor,
        ...(callOptions?.queryKey || []),
        sortKeys,
        filterKeys,
        searchKeys
      ),
      queryFn: async ({ pageParam }) => {
        const cursorParams = pageParam ? { cursor: pageParam as string } : {};
        return await listRaw<Entity>({
          params: { ...params, ...cursorParams, mode: "cursor" },
          ...(callOptions?.options || {}),
        });
      },
      initialPageParam: params.cursor,
      ...(callOptions?.infiniteOptions || {}),
    });
  };

  const prefetchGetMany = <Entity = TEntity>(
    callOptions: MultiQueryOptions<TEntity, Entity, false> & { ids: Id[] }
  ) => {
    const params = mergeParams(callOptions.params) as QueryParams<
      ReturnModel<TEntity, Entity>
    >;
    const { ids = [] } = callOptions || {};

    ids.forEach((id) =>
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
            ...(callOptions?.options || {}),
            requestOptions: {
              ...(callOptions?.options?.requestOptions || {}),
              signal,
            },
          });
          return response;
        },
        ...(callOptions.queryOptions || {}),
      })
    );

    // const prefetchPromises = ids.map((id) =>
    //   queryClient.prefetchQuery({
    //     queryKey: buildQueryKey(
    //       params.entity,
    //       "get",
    //       id,
    //       ...(callOptions.queryKey || [])
    //     ),
    //     queryFn: async ({ signal }) => {
    //       const response = await getRaw<ReturnModel<TEntity, Entity>>({
    //         id,
    //         params,
    //         ...(callOptions?.options || {}),
    //         requestOptions: {
    //           ...(callOptions?.options?.requestOptions || {}),
    //           signal,
    //         },
    //       });
    //       return response;
    //     },
    //     ...(callOptions.queryOptions || {}),
    //   })
    // );

    // await Promise.all(prefetchPromises);
  };

  const prefetchAll = <Entity = TEntity>(options?: {
    list?: IListCallOptions<ReturnModel<TEntity, Entity>, false>;
    items?: Array<{
      id: Id;
      options?: SingleQueryOptions<TEntity, Entity, false>;
    }>;
    infiniteList?: CursorCallOptions<ReturnModel<TEntity, Entity>, false>;
  }) => {
    if (options?.list) {
      prefetchList(options.list);
    }

    if (options?.items) {
      options?.items.forEach((item) =>
        prefetchGet({ ...item.options, id: item.id })
      );
    }

    if (options?.infiniteList) {
      prefetchInfiniteList(options.infiniteList);
    }

    // const promises = [];

    // if (options?.list) {
    //   promises.push(prefetchList(options.list));
    // }

    // if (options?.items) {
    //   promises.push(
    //     ...options?.items.map((item) =>
    //       prefetchGet({ ...item.options, id: item.id })
    //     )
    //   );
    // }

    // if (options?.infiniteList) {
    //   promises.push(prefetchInfiniteList(options.infiniteList));
    // }

    // await Promise.all(promises);
  };

  // ---------- Query Hook Convenience Methods ----------

  const useSuspenseList = <
    Entity = TEntity,
    Mode extends IPaginationModes | undefined = undefined
  >(
    opts?: IListCallOptions<ReturnModel<TEntity, Entity>, true, Mode>
  ) => useListEntities(opts, true);

  const useList = <
    Entity = TEntity,
    Mode extends IPaginationModes | undefined = undefined
  >(
    opts?: IListCallOptions<ReturnModel<TEntity, Entity>, false, Mode>
  ) => useListEntities(opts);
  const useSuspenseInfiniteList = <Entity = TEntity>(
    opts?: CursorCallOptions<ReturnModel<TEntity, Entity>, true>
  ) => useInfiniteListEntities(opts, true);

  const useInfiniteList = <Entity = TEntity>(
    opts?: CursorCallOptions<ReturnModel<TEntity, Entity>>
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
  ) => useGetEntities(opts);

  // ---------- Public API ----------
  const listInfiniteParamsOptions = {} as CursorPaginationConfig<TEntity>;
  const listParamsOptions = {} as OffsetPaginationConfig<TEntity>;
  const listOptions: IListCallOptions<TEntity> = {};
  const listInfiniteOptions: ExtractHookOptions<typeof useInfiniteList> = {};
  const createOptions: ExtractHookOptions<
    typeof useCreate<TEntity, Partial<TEntity>>
  > = {};
  const deleteOptions: ExtractHookOptions<typeof useDelete<TEntity>> = {};
  const Entity: Partial<TEntity> = {};

  return {
    // Raw methods
    listRaw,
    getRaw,
    createRaw,
    updateRaw,
    deleteRaw,

    // Enhanced Mutation hooks with cache management
    useCreate,
    useUpdate,
    useDelete,

    // Enhanced Utilities
    updateCache,
    invalidateCache,
    getUrl,

    // Prefetch
    prefetchList,
    prefetchGet,
    prefetchGetMany,
    prefetchInfiniteList,
    prefetchAll,

    // Query hooks
    useList,
    useGet,
    useInfiniteList,
    useGetMany,

    // Suspense variants
    useSuspenseList,
    useSuspenseGet,
    useSuspenseInfiniteList,
    useSuspenseGetMany,

    // Query client access
    getQueryClient: () => queryClient,

    // types options
    listParamsOptions,
    listOptions,
    listInfiniteParamsOptions,
    listInfiniteOptions,
    createOptions,
    deleteOptions,
    Entity,
  };
}
