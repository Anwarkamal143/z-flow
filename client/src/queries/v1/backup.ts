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
// export type ApiResp<TEntity, Entity> = IApiResponse<
//   ReturnModel<TEntity, Entity>
// >;
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
type ISelectReturnType<T> = {
  pagination_meta: IPaginationMeta | undefined;
  data: T;
  pageParams: unknown[];
  pages: {
    data: T;
    pagination_meta: IPaginationMeta;
  }[];
};

type ListCommonKeys<
  T,
  IS_SUSPENSE extends boolean = false,
  ErrorT = DefaultError
> = {
  options?: IOptions;
  /** single-page query options (suspense vs non-suspense) */
  queryOptions?: Omit<QueryOpts<T, IS_SUSPENSE, ErrorT>, "queryKey">;
  queryKey?: QueryKey;
};
export type ListCallOptions<
  T,
  IS_SUSPENSE extends boolean = false,
  ErrorT = DefaultError
> = ListCommonKeys<T, IS_SUSPENSE, ErrorT> & {
  /** infinite query options (suspense vs non-suspense) */
  infiniteOptions?: Partial<
    Omit<InfiniteOpts<T, IS_SUSPENSE, ErrorT>, "queryKey">
  >;
  /**
   * getNextPageParam derived from the chosen infinite options type.
   * This guarantees `getNextPageParam` always matches the option's expected signature.
   */
  getNextPageParam?: InfiniteOpts<T, IS_SUSPENSE, ErrorT>["getNextPageParam"];
  cb?: (data: ISelectReturnType<T>) => void;
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
  cb?: (data: {
    pagination_meta: IPaginationMeta | undefined;
    data: T;
    pageParams: unknown[];
    pages: {
      data: T;
      pagination_meta: IPaginationMeta;
    }[];
  }) => void;
} & ListCallOptions<T, IS_SUSPENSE, ErrorT>;

// export type OffsetCallOptions<
//   T,
//   IS_SUSPENSE extends boolean = false,
//   ErrorT = DefaultError
// > = {
//   params?: OffsetParams;
// } & ListCallOptions<T, IS_SUSPENSE, ErrorT>; // offset usually doesn't need suspense, but keep flexible
export type OffsetQueryCallOptions<
  T,
  IS_SUSPENSE extends boolean = false,
  ErrorT = DefaultError
> = ListCommonKeys<T, IS_SUSPENSE, ErrorT> & {
  params?: OffsetParams;

  cb?: (data: IPaginatedReturnType<T>) => void;
};

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
  cb?: (data: TData) => void;
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

type IQueryCommonOptions<
  TEntity,
  Entity,
  IS_SUSPENSE extends boolean = false,
  ErrorT = DefaultError
> = {
  queryOptions?: IS_SUSPENSE extends true
    ? Omit<
        UseSuspenseQueryOptions<
          // ApiResp<TEntity, Entity>,
          ApiHooksResp<ReturnModel<TEntity, Entity>>,
          ErrorT,
          // ReturnModel<TEntity, Entity>,
          // ApiResp<TEntity, Entity>,
          ApiHooksResp<ReturnModel<TEntity, Entity>>,
          QueryKey
        >,
        "queryKey"
      >
    : Omit<
        UseQueryOptions<
          // ApiResp<TEntity, Entity>,
          ApiHooksResp<ReturnModel<TEntity, Entity>>,
          ErrorT,
          // ReturnModel<TEntity, Entity>,
          // ApiResp<TEntity, Entity>,
          ApiHooksResp<ReturnModel<TEntity, Entity>>,
          QueryKey
        >,
        "queryKey"
      >;
};
export type IQueryOptions<
  TEntity,
  Entity,
  IS_SUSPENSE extends boolean = false,
  ErrorT = DefaultError
> = CallOptions & {
  slug?: Id;
  cb?: (data: ApiHooksResp<ReturnModel<TEntity, Entity>>) => void;
  // cb?: (data: (ApiResp<TEntity, Entity> | undefined)[]) => void;
} & IQueryCommonOptions<TEntity, Entity, IS_SUSPENSE, ErrorT>;
export type IQueriesOptions<
  TEntity,
  Entity,
  IS_SUSPENSE extends boolean = false,
  ErrorT = DefaultError
> = CallOptions & {
  slugs?: Id[];
  // cb?: (data: (ApiResp<TEntity, Entity> | undefined)[]) => void;
  cb?: (
    data: (ApiHooksResp<ReturnModel<TEntity, Entity>> | undefined)[]
  ) => void;
} & IQueryCommonOptions<TEntity, Entity, IS_SUSPENSE, ErrorT>;

/* -----------------------
   Utility / helpers
   ----------------------- */

/** Merge alias kept for BC */
export type IMergeTypes<T, R> = ReturnModel<T, R>;

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

  // const mergeParams = (...paramSets: QueryParams[]): QueryParams => {
  //   return paramSets.reduce(
  //     (result, params) => deepMerge(result, params),
  //     opts?.defaultParams || ({} as QueryParams)
  //   );
  // };
  const mergeParams = (
    ...paramSets: (QueryParams | undefined)[]
  ): QueryParams => {
    const validParams = paramSets.filter(
      (p): p is QueryParams => p !== undefined
    );
    return validParams.reduce(
      (result, params) => deepMerge(result, params),
      opts?.defaultParams || ({} as QueryParams)
    );
  };
  // ---------- Raw methods ----------
  // async function listRaw<Entity = never>({
  async function listRaw<Entity = TEntity>({
    params,
    options,
    cb,
  }: {
    params?: Record<string, any>;
    options?: IOptions;
    cb?: (data: IPaginatedReturnType<IMergeTypes<TEntity, Entity>[]>) => void;
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
    if (res.data) {
      cb?.(res.data);
    }
    return res?.data as IPaginatedReturnType<IMergeTypes<TEntity, Entity>[]>;
  }

  async function getRaw<T = TEntity>({
    slug,
    params,
    options,
    cb,
  }: {
    slug: Id;
    params?: Record<string, any>;
    options?: IOptions;
    cb?: (data: T) => void;
  }) {
    const resp = await model.get<T>(`${slug}`, {
      path: options?.path,
      query: options?.query,
      requestOptions: {
        ...(options?.requestOptions || {}),
        params: mergeParams(params, options?.requestOptions?.params),
      },
    });

    if (resp.data) {
      cb?.(resp.data);
    }
    return resp;
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
    cb,
  }: {
    payload?: TVars;
    params?: Record<string, any>;
    options?: IOptions;
    cb?: (data: T) => void;
  }) {
    // return http<TEntity>(axiosInst, {
    const resp = await model.create<T>(payload as Partial<TEntity>, {
      query: options?.query,
      path: options?.path,
      requestOptions: {
        ...(options?.requestOptions || {}),
        params: mergeParams(params, options?.requestOptions?.params),
      },
    });

    if (resp.data) {
      cb?.(resp.data);
    }
    return resp;
  }

  async function updateRaw<T = Partial<TEntity>, TVars = Partial<TEntity>>({
    slug,
    payload,
    params,
    options,
    cb,
  }: {
    slug: Id;
    payload: TVars;
    params?: Record<string, any>;
    options?: IOptions;
    cb?: (data: T) => void;
  }) {
    // return http<TEntity>(axiosInst, {
    const resp = await model.update<T>(
      `/${slug}`,
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
    if (resp.data) {
      cb?.(resp.data);
    }
    return resp;
  }

  async function deleteRaw<T = Partial<TEntity>>({
    slug,
    params,
    options,
    cb,
  }: {
    slug: Id;
    params?: Record<string, any>;
    options?: IOptions;
    cb?: (data: T) => void;
  }) {
    // return http<void>(axiosInst, {
    const resp = await model.delete<T>(`/${slug}`, {
      path: options?.path,
      query: options?.query,
      requestOptions: {
        ...(options?.requestOptions || {}),
        params: mergeParams(params, options?.requestOptions?.params),
      },
    });

    if (resp.data) {
      cb?.(resp.data);
    }

    return resp;
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
    callOpts?: OffsetQueryCallOptions<
      IMergeTypes<TEntity, Entity>[],
      IS_SUSPENSE
    >,
    isSuspense = false
  ) {
    const params = mergeParams(callOpts?.params) as OffsetParams;

    const { isEnabled = true } = params || { isEnabled: false };
    const { queryKey = [] } = callOpts || { queryKey: [] };
    const { ...rest } = callOpts?.queryOptions || {};
    const useHook = createQueryHook(isSuspense);
    return useHook({
      queryKey: buildKey(params.entity, params.limit, params.page, ...queryKey),
      queryFn: async ({ signal }) => {
        const resp = await listRaw<Entity>({
          params,
          options: {
            ...callOpts?.options,
            requestOptions: {
              ...(callOpts?.options?.requestOptions || {}),
              signal,
            },
          },
        });
        callOpts?.cb?.(resp);
        return resp;
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
    const { isEnabled = true } = params || { isEnabled: false };

    const useHook = createQueryHook(isSuspense);
    return useHook({
      queryKey: buildKey(params.entity, slug, ...(queryKey || [])),
      queryFn: async ({ signal }) => {
        const res = await getRaw<ReturnModel<TEntity, Entity>>({
          slug: slug as Id,
          params,
          options: {
            ...callOpts?.options,
            requestOptions: {
              ...(callOpts?.options?.requestOptions || {}),
              signal,
            },
          },
        });
        // Cast the response to the expected type
        // return res.data as IApiResponse<UnionIfBPresent<TEntity, Entity>>;
        callOpts?.cb?.(res);
        return res;
      },
      ...(rest ?? {}),
      ...(isSuspense ? {} : { enabled: isEnabled }),
    });
  }

  function useEntitGetQueries<
    Entity = never,
    IS_SUSPENSE extends boolean = false
  >(
    slugs?: Id[],
    callOpts?: IQueriesOptions<TEntity, Entity, IS_SUSPENSE>,
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
              const res = await getRaw<ReturnModel<TEntity, Entity>>({
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
        const result = {
          data: results.map((result) => result.data),
          isLoading: results.some((result) => result.isLoading),
          error: results.map((result) => result.error),
        };
        callOpts?.cb?.(result.data);
        return result;
      },
    });
  }

  function useList<Entity = never>(
    callOpts?: OffsetQueryCallOptions<IMergeTypes<TEntity, Entity>[]>
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
    callOpts?: OffsetQueryCallOptions<IMergeTypes<TEntity, Entity>[], true>
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
      const pagination_meta = isPages
        ? data.pages?.[data.pages?.length - 1]?.pagination_meta
        : getEmptyPaginationMeta({ limit: params.limit });
      const selectData = {
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
      callOpts?.cb?.(selectData);
      return selectData;
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
    callOpts?: IQueryOptions<TEntity, Entity, false>
  ) {
    const { slug } = callOpts || {};
    return useEntitGetQuery(slug, callOpts);
  }
  function useGetQuries<Entity = never>(
    callOpts?: IQueriesOptions<TEntity, Entity, false>
  ) {
    const { slugs } = callOpts || {};
    return useEntitGetQueries(slugs, callOpts);
  }
  function useSuspenseGetQuries<Entity = never>(
    callOpts?: IQueriesOptions<TEntity, Entity, false>
  ) {
    const { slugs } = callOpts || {};

    return useEntitGetQueries(slugs, callOpts, true);
  }
  function useSuspenseGet<Entity = never>(
    callOpts?: IQueryOptions<TEntity, Entity, true>
  ) {
    const { slug } = callOpts || {};
    return useEntitGetQuery(slug, callOpts, true);
  }

  function useCreate<Entity = never, Tvars = never>(
    callOpts?: MutateCallOptions<
      IMergeTypes<TEntity, Entity>,
      Partial<ReturnModel<TEntity, Tvars>>
    >
  ) {
    return useMutation<
      IApiResponse<IMergeTypes<TEntity, Entity>>,
      // ApiModelDataTypes[T],
      IResponseError<null>,
      Partial<ReturnModel<TEntity, Tvars>>
    >({
      mutationFn: (payload: Partial<ReturnModel<TEntity, Tvars>>) =>
        createRaw({
          payload,
          params: callOpts?.params,
          options: callOpts?.options,
          cb: callOpts?.cb,
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
      Partial<ReturnModel<TEntity, Tvars>>
    >
  ) {
    return useMutation<
      IApiResponse<IMergeTypes<TEntity, Entity>>,
      // ApiModelDataTypes[T],
      IResponseError<null>,
      Partial<ReturnModel<TEntity, Tvars>>
    >({
      mutationFn: (payload: Partial<ReturnModel<TEntity, Tvars>>) =>
        createRaw({
          payload,
          params: callOpts?.params,
          options: callOpts?.options,
          cb: callOpts?.cb,
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
      { id: Id; data: Partial<ReturnModel<TEntity, Tvars>> }
    >
  ) {
    return useMutation<
      IApiResponse<{ id: Id; data: TEntity & IPartialIfExist<Entity> }>,
      // ApiModelDataTypes[T],
      IResponseError<null>,
      { id: Id; data: Partial<ReturnModel<TEntity, Tvars>> }
    >({
      mutationFn: ({
        id,
        data,
      }: {
        id: Id;
        data: Partial<ReturnModel<TEntity, Tvars>>;
      }) =>
        updateRaw({
          slug: id,
          payload: data,
          params: callOpts?.params,
          options: callOpts?.options,
          cb: callOpts?.cb,
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
          cb: callOpts?.cb,
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
  function getUrl(endPoint?: string) {
    return model.fullURL + (endPoint ? `/${endPoint}` : "");
  }
  /****************************************Prefetch Helper****************************************/

  // ---------- Prefetch helpers ----------
  // Note: using simple typings for prefetch functions to avoid depending on
  // internal QueryClient option type names. They call queryClient.prefetchQuery
  // and prefetchInfiniteQuery under the hood.
  async function prefetchList<Entity = never>(
    callOpts?: OffsetQueryCallOptions<IMergeTypes<TEntity, Entity>[]>
  ) {
    const params = mergeParams(callOpts?.params) as OffsetParams;
    const { isEnabled = true } = params || { isEnabled: false };
    const queryKey = [...(callOpts?.queryKey || []), "offset_list"];
    const key = buildKey(params.entity, params.limit, params.page, ...queryKey);
    await qs.prefetchQuery({
      queryKey: key,
      queryFn: async ({ signal }) => {
        const resp = await listRaw<Entity>({
          params,
          options: {
            ...callOpts?.options,
            requestOptions: {
              ...(callOpts?.options?.requestOptions || {}),
              signal,
            },
          },
        });
        callOpts?.cb?.(resp);
        return resp;
      },

      ...(callOpts?.queryOptions || {}),
    });
  }

  async function prefetchGet<Entity = never>(
    callOpts?: IQueryOptions<TEntity, Entity, false> & {
      slug?: Id;
    }
  ) {
    const params = mergeParams(callOpts?.params);
    const { queryKey = [], slug } = callOpts || { queryKey: [] };
    const key = buildKey(params.entity, slug, ...(queryKey || []));
    const { queryFn, ...rest } = callOpts?.queryOptions || {};

    await qs.prefetchQuery({
      queryKey: key,
      queryFn: async ({ signal }) => {
        const res = await getRaw<ReturnModel<TEntity, Entity>>({
          slug: slug as Id,
          params,
          options: {
            ...callOpts?.options,
            requestOptions: {
              ...(callOpts?.options?.requestOptions || {}),
              signal,
            },
          },
        });
        // Cast the response to the expected type
        // return res.data as IApiResponse<UnionIfBPresent<TEntity, Entity>>;
        callOpts?.cb?.(res);
        return res;
      },
      ...(rest ?? {}),
    });
  }

  async function prefetchCursorList<Entity = never>(
    callOpts?: CursorCallOptions<IMergeTypes<TEntity, Entity>[]>
  ) {
    const params = mergeParams(callOpts?.params) as any;
    const { queryKey = [] } = callOpts || { queryKey: [] };
    const key = buildKey(
      params.entity,
      params.limit,
      ...queryKey,
      "cursor_list"
    );
    const { queryFn, getNextPageParam, ...rest } =
      callOpts?.infiniteOptions || {};
    await qs.prefetchInfiniteQuery({
      queryKey: key,
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

      initialPageParam: params?.cursor || undefined,
      ...rest,
    });
  }

  /**
   * Prefetch many tasks in parallel.
   * Accepts an array of objects with `type: 'get'|'list'|'cursor'` and params.
   * Example:
   *  prefetchMany([
   *    { type: 'get', slug: '1', opts: {  IQueryOptions  } },
   *    { type: 'list', opts: { params: { page: 1 } } }
   *  ])
   */
  type PrefetchTask =
    | {
        type: "get";
        opts?: IQueryOptions<TEntity, any, false> & {
          slug?: Id;
        };
      }
    | {
        type: "list";
        opts?: OffsetQueryCallOptions<IMergeTypes<TEntity, any>[]>;
      }
    | {
        type: "cursor";
        opts?: CursorCallOptions<IMergeTypes<TEntity, any>[]>;
      };

  async function prefetchMany(tasks: PrefetchTask[]) {
    const promises = tasks.map((t) => {
      if (t.type === "get") {
        return prefetchGet(t.opts);
      }
      if (t.type === "list") {
        return prefetchList(t.opts);
      }
      if (t.type === "cursor") {
        return prefetchCursorList(t.opts);
      }
      return Promise.resolve();
    });

    await Promise.all(promises);
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
    getUrl,

    prefetchList,
    prefetchGet,
    prefetchMany,
  };
}
