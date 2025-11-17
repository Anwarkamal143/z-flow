/* eslint-disable @typescript-eslint/no-explicit-any */
/* =============================
   Query / CRUD Types - refactor
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
   Small building blocks
   ----------------------- */

export type Id = string | number;
export type ISortOrder = "asc" | "desc";
/** Default error type - callers may override with a different ErrorT */
export type DefaultError = IResponseError<null>;

/** ReturnModelType alias for clarity */
export type ReturnModel<TEntity, Entity> = ReturnModelType<TEntity, Entity>;

/** API response wrappers */
export type ApiResp<TEntity, Entity> = IApiResponse<
  ReturnModel<TEntity, Entity>
>;
export type ApiHooksResp<T> = IApiResponseHooks<T>;

/* -----------------------
   Query param shapes
   ----------------------- */

export type BaseParams = { entity?: string };

export type OffsetParams = BaseParams & {
  page?: number;
  limit?: number;
  isEnabled?: boolean;
  sort?: ISortOrder;
};

export type CursorParams = BaseParams & {
  cursor?: string;
  limit: number;
  isEnabled?: boolean;
  sort?: ISortOrder;
};

/** Either offset or cursor, plus any extras */
export type QueryParams = (OffsetParams | CursorParams) & {
  [key: string]: any;
};

/* -----------------------
   Request / Call options
   ----------------------- */

export type IOptions = {
  query?: QueryParams;
  path?: string;
  requestOptions?: Partial<IRequestOptions>;
};

export type CallOptions = {
  params?: QueryParams;
  options?: IOptions;
  queryKey?: QueryKey;
};

/* -----------------------
   List / Pagination helpers
   ----------------------- */

export type ListData<T> = { data: T; pagination_meta: IPaginationMeta };
export type ListInfinite<T> = InfiniteData<ListData<T>, unknown>;

/** Query options depending on suspense mode */
export type QueryOpts<
  T,
  S extends boolean,
  ErrorT = DefaultError
> = S extends true
  ? UseSuspenseQueryOptions<ApiHooksResp<T>, ErrorT, ListData<T>, QueryKey>
  : UseQueryOptions<ApiHooksResp<T>, ErrorT, ListData<T>, QueryKey>;

export type InfiniteOpts<
  T,
  S extends boolean,
  ErrorT = DefaultError
> = S extends true
  ? UseSuspenseInfiniteQueryOptions<
      ApiHooksResp<T>,
      ErrorT,
      ListInfinite<T>,
      QueryKey
    >
  : UseInfiniteQueryOptions<ApiHooksResp<T>, ErrorT, ListInfinite<T>, QueryKey>;

/* -----------------------
   ListCallOptions
   ----------------------- */

export type ListCallOptions<
  T,
  IS_SUSPENSE extends boolean = false,
  ErrorT = DefaultError
> = {
  options?: IOptions;
  /** single-page query options (suspense vs non-suspense) */
  queryOptions?: Omit<QueryOpts<T, IS_SUSPENSE, ErrorT>, "queryKey">;
  /** infinite query options (suspense vs non-suspense) */
  infiniteOptions?: Partial<
    Omit<InfiniteOpts<T, IS_SUSPENSE, ErrorT>, "queryKey">
  >;
  queryKey?: QueryKey;
  /**
   * getNextPageParam derived from the chosen infinite options type.
   * This guarantees `getNextPageParam` always matches the option's expected signature.
   */
  getNextPageParam?: InfiniteOpts<T, IS_SUSPENSE, ErrorT>["getNextPageParam"];
};

/* -----------------------
   Cursor / Offset wrappers
   ----------------------- */

export type CursorCallOptions<
  T,
  IS_SUSPENSE extends boolean = false,
  ErrorT = DefaultError
> = {
  params?: CursorParams;
} & ListCallOptions<T, IS_SUSPENSE, ErrorT>;

export type OffsetCallOptions<
  T,
  IS_SUSPENSE extends boolean = false,
  ErrorT = DefaultError
> = {
  params?: OffsetParams;
} & ListCallOptions<T, IS_SUSPENSE, ErrorT>; // offset usually doesn't need suspense, but keep flexible

/* -----------------------
   Mutation options
   ----------------------- */

export type MutateCallOptions<
  TData = any,
  TVars = any,
  ErrorT = DefaultError
> = {
  params?: Record<string, any>;
  options?: IOptions;
  mutationOptions?: UseMutationOptions<IApiResponse<TData>, ErrorT, TVars>;
};

/* -----------------------
   Single entity query
   ----------------------- */

/**
 * IQueryOptions - single entity query options.
 *
 * TEntity/Entity mirror your ReturnModelType signature.
 * IS_SUSPENSE toggles between suspense and non-suspense react-query types.
 */
export type IQueryOptions<
  TEntity,
  Entity,
  IS_SUSPENSE extends boolean = false,
  ErrorT = DefaultError
> = CallOptions & {
  queryOptions?: IS_SUSPENSE extends true
    ? Omit<
        UseSuspenseQueryOptions<
          ApiResp<TEntity, Entity>,
          ErrorT,
          ReturnModel<TEntity, Entity>,
          QueryKey
        >,
        "queryKey"
      >
    : Omit<
        UseQueryOptions<
          ApiResp<TEntity, Entity>,
          ErrorT,
          ReturnModel<TEntity, Entity>,
          QueryKey
        >,
        "queryKey"
      >;
};

/* -----------------------
   Utility / helpers
   ----------------------- */

/** Merge alias kept for BC */
export type IMergeTypes<T, R> = ReturnModelType<T, R>;

// ---------------- HELPERS ---------------------- //
// function deepMerge<T extends QueryParams>(target: T, source: T): T {
//   const output = { ...target };

//   for (const key in source) {
//     const sourceVal = source[key];
//     const targetVal = target[key];

//     if (
//       sourceVal &&
//       typeof sourceVal === "object" &&
//       !Array.isArray(sourceVal)
//     ) {
//       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//       //   @ts-ignore
//       output[key] = deepMerge(
//         (targetVal as QueryParams) || {},
//         sourceVal as QueryParams
//       );
//     } else {
//       // Replace arrays or primitive values directly
//       output[key] = sourceVal;
//     }
//   }

//   return output;
// }
function deepMerge<T extends Record<string, any>>(
  base: T,
  overrides: Partial<T> = {}
): T {
  const result = { ...base };

  for (const key in overrides) {
    const val = overrides[key];

    if (val === undefined) continue;

    // simple override for primitives, arrays, functions
    if (typeof val !== "object" || val === null || Array.isArray(val)) {
      (result as any)[key] = val;
      continue;
    }

    // recursively merge objects
    const baseVal = base[key];
    if (typeof baseVal === "object" && baseVal !== null) {
      (result as any)[key] = deepMerge(baseVal as any, val);
    } else {
      (result as any)[key] = val;
    }
  }

  return result;
}
function filterQueryOptions(
  opts: Record<string, any> | undefined,
  isSuspense: boolean
) {
  if (!opts) return {};

  if (!isSuspense) return opts;

  // ❗ Remove keys NOT allowed in suspense queries
  const { enabled, placeholderData, ...rest } = opts;

  return rest;
}

const getEmptyPaginationMeta = (meta: any = {}) =>
  ({
    next: null,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    limit: 2,

    ...meta,
  } as IPaginationMeta);
export type CrudFactoryOptions<
  TParams = Record<string, any>,
  Prefix = string
> = { defaultParams?: TParams & { entity: Prefix } };

const buildKey = (...parts: (string | number | undefined | null | unknown)[]) =>
  parts.filter(Boolean);

// ---------------- CRUD Factory -----------------
export function createCrudClient<TEntity, TParams = Record<string, any>>(
  model: Model<TEntity>,
  opts?: CrudFactoryOptions<TParams>
) {
  const qs = getQueryClient();
  // const mergeParams = (callParams = {}) =>
  //   ({
  //     ...(opts?.defaultParams || {}),
  //     ...(callParams || {}),
  //   } as QueryParams);
  const mergeParams = (
    source: Record<string, any> = {},
    target: Record<string, any> = {},
    ...rest: QueryParams[]
  ): QueryParams => {
    let result = deepMerge(opts?.defaultParams || ({} as any), source);
    result = deepMerge(result, target);

    for (const obj of rest) {
      result = deepMerge(result, obj);
    }

    return result;
  };
  // ---------- Raw methods ----------
  async function listRaw<Entity = never>({
    params,
    options,
  }: {
    params?: Record<string, any>;
    options?: IOptions;
  }): Promise<IPaginatedReturnType<IMergeTypes<TEntity, Entity>[]>> {
    const res = await model.list<
      IPaginatedReturnType<IMergeTypes<TEntity, Entity>[]>
    >({
      path: options?.path,
      query: options?.query,
      requestOptions: {
        params: mergeParams(params),
        ...(options?.requestOptions || {}),
      },
    });

    return res?.data as IPaginatedReturnType<IMergeTypes<TEntity, Entity>[]>;
  }

  async function getRaw<T = TEntity>({
    slug,
    params,
    options,
  }: {
    slug: Id;
    params?: Record<string, any>;
    options?: IOptions;
  }) {
    return model.get<T>(`${slug}`, {
      path: options?.path,
      query: options?.query,
      requestOptions: {
        ...(options?.requestOptions || {}),
        params: mergeParams(params, options?.requestOptions?.params),
      },
    });
  }

  // async function createRaw<T = Partial<TEntity>, TVars = Partial<TEntity>>(
  //   payload: TVars,
  //   params?: Record<string, any>,
  //   options?: IOptions
  // ) {
  async function createRaw<T = Partial<TEntity>, TVars = Partial<TEntity>>({
    payload,
    params,
    options,
  }: {
    payload?: TVars;
    params?: Record<string, any>;
    options?: IOptions;
  }) {
    // return http<TEntity>(axiosInst, {
    return model.create<T>(payload as Partial<TEntity>, {
      query: options?.query,
      path: options?.path,
      requestOptions: {
        ...(options?.requestOptions || {}),
        params: mergeParams(params, options?.requestOptions?.params),
      },
    });
  }

  async function updateRaw<T = Partial<TEntity>, TVars = Partial<TEntity>>({
    slug,
    payload,
    params,
    options,
  }: {
    slug: Id;
    payload: TVars;
    params?: Record<string, any>;
    options?: IOptions;
  }) {
    // return http<TEntity>(axiosInst, {
    return model.update<T>(`/${slug}`, payload as Partial<TEntity>, {
      path: options?.path,
      query: options?.query,
      requestOptions: {
        ...(options?.requestOptions || {}),
        params: mergeParams(params, options?.requestOptions?.params),
      },
    });
  }

  async function deleteRaw<T = Partial<TEntity>>({
    slug,
    params,
    options,
  }: {
    slug: Id;
    params?: Record<string, any>;
    options?: IOptions;
  }) {
    // return http<void>(axiosInst, {
    return model.delete<T>(`/${slug}`, {
      path: options?.path,
      query: options?.query,
      requestOptions: {
        ...(options?.requestOptions || {}),
        params: mergeParams(params, options?.requestOptions?.params),
      },
    });
  }

  // ---------- React Query hooks ----------

  function createQueryHook<S extends boolean>(suspense: S) {
    return suspense ? useSuspenseQuery : useQuery;
  }
  function createQueriesHook<S extends boolean>(suspense: S) {
    return suspense ? useSuspenseQueries : useQueries;
  }

  function createQueryListHook<S extends boolean>(suspense: S) {
    return suspense ? useSuspenseInfiniteQuery : useInfiniteQuery;
  }

  function useEntitQuery<Entity = never, IS_SUSPENSE extends boolean = false>(
    callOpts?: OffsetCallOptions<IMergeTypes<TEntity, Entity>[], IS_SUSPENSE>,
    isSuspense = false
  ) {
    const params = mergeParams(callOpts?.params) as OffsetParams;
    const { isEnabled = true } = params || { isEnabled: false };
    const { queryKey = [] } = callOpts || { queryKey: [] };
    const { ...rest } = callOpts?.queryOptions || {};
    const useHook = createQueryHook(isSuspense);
    return useHook({
      queryKey: buildKey(params.entity, params.limit, params.page, ...queryKey),
      queryFn: async () => {
        return await listRaw<Entity>({
          params,
          options: {
            ...callOpts?.options,
            requestOptions: {
              ...(callOpts?.options?.requestOptions || {}),
              // signal,
            },
          },
        });
      },

      ...(rest || {}),
      ...(isSuspense ? {} : { enabled: isEnabled }),
    });
  }
  function useEntitGetQuery<
    Entity = never,
    IS_SUSPENSE extends boolean = false
  >(
    slug?: Id,
    callOpts?: IQueryOptions<TEntity, Entity, IS_SUSPENSE>,
    isSuspense = false
  ) {
    const params = mergeParams(callOpts?.params);
    const { queryKey = [] } = callOpts || { queryKey: [] };
    const { queryFn, ...rest } = callOpts?.queryOptions || {};
    const useHook = createQueryHook(isSuspense);
    return useHook({
      queryKey: buildKey(params.entity, slug, ...(queryKey || [])),
      queryFn: async ({ signal }) => {
        const res = await getRaw<ReturnModelType<TEntity, Entity>>({
          slug: slug as Id,
          params,
          options: {
            ...callOpts?.options,
            requestOptions: {
              ...(callOpts?.options?.requestOptions || {}),
              // signal,
            },
          },
        });
        // Cast the response to the expected type
        // return res.data as IApiResponse<UnionIfBPresent<TEntity, Entity>>;
        return res;
      },
      ...(rest ?? {}),
      ...(isSuspense ? {} : { enabled: !!slug }),
    });
  }

  function useEntitGetQueries<
    Entity = never,
    IS_SUSPENSE extends boolean = false
  >(
    slugs?: Id[],
    callOpts?: IQueryOptions<TEntity, Entity, IS_SUSPENSE>,
    isSuspense = false
  ) {
    const params = mergeParams(callOpts?.params);
    const { queryKey = [] } = callOpts || { queryKey: [] };
    const { ...rest } = callOpts?.queryOptions || {};
    const safeQueryOptions = filterQueryOptions(rest, isSuspense);
    const useHook = createQueriesHook(isSuspense);
    return useHook({
      queries: (slugs || [])?.map((slug) => {
        return {
          queryKey: buildKey(params.entity, ...(queryKey || []), slug),
          queryFn: async () => {
            if (slug) {
              const res = await getRaw<ReturnModelType<TEntity, Entity>>({
                slug,
                params,
                options: {
                  ...callOpts?.options,
                  requestOptions: {
                    ...(callOpts?.options?.requestOptions || {}),
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
          ...(isSuspense ? {} : { enabled: !!slug }),
          ...safeQueryOptions,
        };
      }),
      combine: (results) => {
        return {
          data: results.map((result) => result.data),
          isLoading: results.some((result) => result.isLoading),
          error: results.map((result) => result.error),
        };
      },
    });
  }

  function useList<Entity = never>(
    callOpts?: OffsetCallOptions<IMergeTypes<TEntity, Entity>[]>
  ) {
    return useEntitQuery<Entity>({
      ...callOpts,
      queryOptions: {
        ...(callOpts?.queryOptions || {}),
      },
      queryKey: [...(callOpts?.queryKey || []), "offset_list"],
    });
  }
  // ---------- React Query hooks ----------
  function useSuspenseList<Entity = never>(
    callOpts?: OffsetCallOptions<IMergeTypes<TEntity, Entity>[], true>
  ) {
    return useEntitQuery<Entity>({
      ...callOpts,
      queryOptions: {
        ...(callOpts?.queryOptions || {}),
      },
      queryKey: [...(callOpts?.queryKey || []), "offset_suspense_list"],
    });
  }

  function useEntityInfinteList<
    Entity = never,
    IS_SUSPENSE extends boolean = false
  >(
    callOpts?: CursorCallOptions<IMergeTypes<TEntity, Entity>[], IS_SUSPENSE>,
    isSuspense = false
  ) {
    const params = mergeParams(callOpts?.params) as any;

    const { isEnabled = true } = params || { isEnabled: false };
    const { queryFn, getNextPageParam, ...rest } =
      callOpts?.infiniteOptions || {};
    const { queryKey = [] } = callOpts || { queryKey: [] };
    const Select = (
      data: InfiniteData<ApiHooksResp<IMergeTypes<TEntity, Entity>[]>, unknown>
    ) => {
      // Flatten and apply selection function if provided
      const isPages = data.pages?.length > 0;
      let items = [];
      // const allItems = data.pages
      //   .filter((p) => !!p.data?.length)
      //   .flatMap((page) =>  page.data!
      //   );
      for (let index = 0; index < data.pages.length; index++) {
        const element = data.pages[index];
        if (element.data?.length) {
          items.push(...element.data!);
        }
      }
      console.log(items);
      const pagination_meta = isPages
        ? data.pages?.[data.pages?.length - 1]?.pagination_meta
        : getEmptyPaginationMeta({ limit: params.limit });
      return {
        pagination_meta,
        data: items,
        pageParams: data.pageParams,
        pages: data.pages as {
          data: IMergeTypes<TEntity, Entity>[];
          pagination_meta: IPaginationMeta;
        }[],
        // pages: data.pages as {
        //   data: IMergeTypes<TEntity, Entity>[];
        //   pagination_meta: IPaginationMeta;
        // }[],
      };
      // ? select(meta, allItems, data.pageParams)
      // : { meta, data: allItems, pageParams: data.pageParams };
    };
    const useHook = createQueryListHook(isSuspense);

    return useHook({
      queryKey: buildKey(params.entity, params.limit, ...queryKey),
      queryFn: async ({ pageParam }) => {
        if (pageParam) params.cursor = pageParam as string;
        return await listRaw<Entity>({
          params: { ...params, mode: "cursor" },
          options: {
            ...callOpts?.options,
            requestOptions: {
              ...(callOpts?.options?.requestOptions || {}),
              // signal,
            },
          },
        });
      },
      getNextPageParam: (lastPage) => {
        // console.log(lastPage, "lastpage");

        // return lastPage?.nextCursor || undefined;
        return lastPage.pagination_meta?.next || undefined;
      },
      initialPageParam: params?.cursor || undefined,
      ...rest,
      ...(isSuspense ? {} : { enabled: isEnabled }),

      select: Select,
    });
  }
  function useCursorList<Entity = never>(
    callOpts?: CursorCallOptions<IMergeTypes<TEntity, Entity>[]>
  ) {
    return useEntityInfinteList({
      ...(callOpts || {}),
      queryOptions: {
        ...(callOpts?.queryOptions || {}),
      },
      queryKey: [...(callOpts?.queryKey || []), "cursor_list"],
    });
  }
  function useSuspenseCursorList<Entity = never>(
    callOpts?: CursorCallOptions<IMergeTypes<TEntity, Entity>[], true>
  ) {
    return useEntityInfinteList({
      ...(callOpts || {}),
      queryOptions: {
        ...(callOpts?.queryOptions || {}),
      },
      queryKey: [...(callOpts?.queryKey || []), "cursor_suspense_list"],
    });
  }

  function useGet<Entity = never>(
    slug?: Id,
    callOpts?: IQueryOptions<TEntity, Entity, false>
  ) {
    return useEntitGetQuery(slug, callOpts);
  }
  function useGetQuries<Entity = never>(
    slugs?: Id[],
    callOpts?: IQueryOptions<TEntity, Entity, false>
  ) {
    return useEntitGetQueries(slugs, callOpts);
  }
  function useSuspenseGetQuries<Entity = never>(
    slugs?: Id[],
    callOpts?: IQueryOptions<TEntity, Entity, false>
  ) {
    return useEntitGetQueries(slugs, callOpts, true);
  }
  function useSuspenseGet<Entity = never>(
    slug?: Id,
    callOpts?: IQueryOptions<TEntity, Entity, true>
  ) {
    return useEntitGetQuery(slug, callOpts, true);
  }

  function useCreate<Entity = never, Tvars = never>(
    callOpts?: MutateCallOptions<
      IMergeTypes<TEntity, Entity>,
      Partial<ReturnModelType<TEntity, Tvars>>
    >
  ) {
    return useMutation<
      IApiResponse<IMergeTypes<TEntity, Entity>>,
      // ApiModelDataTypes[T],
      IResponseError<null>,
      Partial<ReturnModelType<TEntity, Tvars>>
    >({
      mutationFn: (payload: Partial<ReturnModelType<TEntity, Tvars>>) =>
        createRaw({
          payload,
          params: callOpts?.params,
          options: callOpts?.options,
        }),
      onSuccess: async (data) => {
        return data;
      },
      ...(callOpts?.mutationOptions ?? {}),
    });
  }
  function usePost<Entity = never, Tvars = never>(
    callOpts?: MutateCallOptions<
      IMergeTypes<TEntity, Entity>,
      Partial<ReturnModelType<TEntity, Tvars>>
    >
  ) {
    return useMutation<
      IApiResponse<IMergeTypes<TEntity, Entity>>,
      // ApiModelDataTypes[T],
      IResponseError<null>,
      Partial<ReturnModelType<TEntity, Tvars>>
    >({
      mutationFn: (payload: Partial<ReturnModelType<TEntity, Tvars>>) =>
        createRaw({
          payload,
          params: callOpts?.params,
          options: callOpts?.options,
        }),
      onSuccess: async (data) => {
        return data;
      },
      ...(callOpts?.mutationOptions ?? {}),
    });
  }

  function useUpdate<Entity = never, Tvars = never>(
    callOpts?: MutateCallOptions<
      { id: Id; data: TEntity & IPartialIfExist<Entity> },
      { id: Id; data: Partial<ReturnModelType<TEntity, Tvars>> }
    >
  ) {
    return useMutation<
      IApiResponse<{ id: Id; data: TEntity & IPartialIfExist<Entity> }>,
      // ApiModelDataTypes[T],
      IResponseError<null>,
      { id: Id; data: Partial<ReturnModelType<TEntity, Tvars>> }
    >({
      mutationFn: ({
        id,
        data,
      }: {
        id: Id;
        data: Partial<ReturnModelType<TEntity, Tvars>>;
      }) =>
        updateRaw({
          slug: id,
          payload: data,
          params: callOpts?.params,
          options: callOpts?.options,
        }),
      onSuccess: async (_res) => {
        return _res;
      },
      ...(callOpts?.mutationOptions ?? {}),
    });
  }

  function useDelete(callOpts?: MutateCallOptions<Id, Id>) {
    return useMutation<IApiResponse<Id>, IResponseError<null>, Id>({
      mutationFn: (id: Id) =>
        deleteRaw({
          slug: id,
          params: callOpts?.params,
          options: callOpts?.options,
        }),

      ...(callOpts?.mutationOptions ?? {}),
    });
  }

  function updateCacheById(
    id?: Id,
    payLoad?: Partial<TEntity>,
    queryKey?: QueryKey | string
  ) {
    if (!id) {
      return false;
    }
    const keys = [opts?.defaultParams?.entity, id, queryKey].filter(Boolean);
    qs.setQueryData(keys, (data: TEntity) => {
      if (!data) {
        return undefined;
      }
      return { ...data, ...payLoad };
    });
  }

  return {
    listRaw,
    getRaw,
    createRaw,
    updateRaw,
    deleteRaw,
    useList,
    useSuspenseList,
    useGet,
    useSuspenseGet,
    useGetQuries,
    useSuspenseGetQuries,
    useCreate,
    usePost,
    useUpdate,
    useDelete,
    useCursorList,
    useSuspenseCursorList,
    updateCacheById,
  };
}
