/* =============================
   Enhanced CRUD Client Factory
   ============================= */

import { getQueryClient } from '@/get-query-client'
import { withErrorHandler } from '@/lib'
import { IRequestOptions, Model } from '@/models'
import {
  IApiResponse,
  IPaginatedReturnType,
  IPaginationMeta,
  ReturnModelType,
} from '@/types/Iquery'
import {
  MutateOptions,
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useSuspenseInfiniteQuery,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { filterSchema, searchSchema, sortSchema } from '../pagination/schema'
import {
  ApiHooksResp,
  BasePaginationConfig,
  CrudFactoryOptions,
  CursorCallOptions,
  CursorPaginationConfig,
  DefaultError,
  ExtractHookOptions,
  Id,
  IListCallOptions,
  InfiniteListData,
  IPaginationModes,
  ListReturnType,
  MultiQueryOptions,
  MutationCallOptions,
  OffsetPaginationConfig,
  QueryParams,
  RequestOptions,
  ReturnModel,
  SingleQueryOptions,
} from './types'

/* -----------------------
   Enhanced Utility Functions
   ----------------------- */

const buildQueryKey = (
  ...parts: (string | number | undefined | null | unknown)[]
) => parts.filter((a) => a != null)

const getEmptyPaginationMeta = (
  meta: Partial<IPaginationMeta> = {},
): IPaginationMeta => ({
  next: undefined,
  totalRecords: 0,
  totalPages: 0,
  hasMore: false,
  limit: 10,
  ...meta,
})

const deepMerge = <T extends Record<string, any>>(
  base: T,
  overrides: Partial<T> = {},
): T => {
  const result = { ...base }

  for (const key in overrides) {
    const val = overrides[key]
    if (val === undefined) continue

    if (typeof val !== 'object' || val === null || Array.isArray(val)) {
      ;(result as any)[key] = val
    } else {
      const baseVal = base[key]
      ;(result as any)[key] =
        typeof baseVal === 'object' && baseVal !== null
          ? deepMerge(baseVal as any, val)
          : val
    }
  }

  return result
}

// Enhanced merging function specifically for RequestOptions
const mergeRequestOptions = (
  base?: Partial<IRequestOptions>,
  overrides?: Partial<IRequestOptions>,
): Partial<IRequestOptions> => {
  if (!base && !overrides) return {}
  if (!base) return overrides || {}
  if (!overrides) return base

  return {
    ...base,
    ...overrides,
    params: deepMerge(base.params || {}, overrides.params || {}),
    headers: deepMerge(base.headers || {}, overrides.headers || {}),
  }
}

const filterSuspenseOptions = <T extends Record<string, any> | undefined>(
  opts: T | undefined,
  isSuspense: boolean,
): Partial<Omit<T, 'enabled' | 'placeholderData'>> => {
  if (!opts || !isSuspense) return opts || {}

  const { enabled, placeholderData, ...rest } = opts
  return rest
}

/* -----------------------
   CRUD Client Factory
   ----------------------- */

export function createCrudClient<TEntity, TParams = Record<string, any>>(
  model: Model<TEntity>,
  opts?: CrudFactoryOptions<TParams>,
) {
  const queryClient = getQueryClient()

  const mergeParams = <T = Record<string, any>>(
    ...paramSets: (QueryParams<T> | undefined)[]
  ): QueryParams<T> => {
    const validParams = paramSets.filter(
      (p): p is QueryParams<T> => p !== undefined,
    )
    return validParams.reduce(
      (result, params) => deepMerge(result || {}, params || {}),
      opts?.defaultParams || {},
    ) as QueryParams<T>
  }
  const validateFilters = <T extends Record<string, any>>({
    search,
    filters,
    sorts,
  }: BasePaginationConfig<T>) => {
    const filtersObject: any = {}
    if (search) {
      let searchKeys = searchSchema.parse(search)
      searchKeys =
        typeof searchKeys == 'object' ? JSON.stringify(searchKeys) : searchKeys
      if (searchKeys) {
        filtersObject['search'] = searchKeys
      }
    }
    if (filters) {
      let filtersKeys = filterSchema.parse(filters)
      filtersKeys =
        typeof filtersKeys == 'object'
          ? JSON.stringify(filtersKeys)
          : filtersKeys
      if (filtersKeys) {
        filtersObject['filters'] = filtersKeys
      }
    }
    if (filters) {
      let sortKeys = sortSchema.parse(sorts)
      sortKeys =
        typeof sortKeys == 'object' ? JSON.stringify(sortKeys) : sortKeys
      if (sortKeys) {
        filtersObject['sorts'] = sortKeys
      }
    }

    return Object.keys(filtersObject).length > 0 ? filtersObject : null
  }
  // ---------- Enhanced Raw API Methods ----------

  const listRaw = async <T = TEntity>({
    params,
    onSuccess,
    ...options
  }: RequestOptions<ReturnModel<TEntity, T>> & {
    params?: QueryParams<ReturnModel<TEntity, T>>
    onSuccess?: (data: IPaginatedReturnType<ReturnModel<TEntity, T>[]>) => void
  }): Promise<IPaginatedReturnType<ReturnModel<TEntity, T>[]>> => {
    const { isEnabled, sorts, search, filters, ...mergedParams } =
      mergeParams<ReturnModel<TEntity, T>>(params)
    const validateParams = validateFilters<any>({ search, filters, sorts })
    const mergedRequestOptions = mergeRequestOptions(
      {
        params: {
          ...mergedParams,
          ...(validateParams ? validateParams : {}),
        },
      },
      options?.requestOptions,
    )

    const response = await model.list<
      IPaginatedReturnType<ReturnModel<TEntity, T>[]>
    >({
      path: options?.path,
      query: options?.query, // Now query type matches params type
      requestOptions: {
        ...mergedRequestOptions,
        params: {
          ...mergedRequestOptions.params,
        },
      },
    })

    if (response.data) {
      onSuccess?.(response.data)
    }

    return response.data as IPaginatedReturnType<ReturnModel<TEntity, T>[]>
  }

  const getRaw = async <T = TEntity>({
    id,
    params,

    onSuccess,
    ...rest
  }: RequestOptions<T> & {
    id: Id
    params?: QueryParams<T>
    // options?: RequestOptions<T>; // Generic options
    onSuccess?: (data: T) => void
  }) => {
    const { isEnabled, sorts, filters, search, ...mergedParams } =
      mergeParams<T>(params, rest?.requestOptions?.params)

    const validateParams = validateFilters<any>({ search, filters, sorts })
    const mergedRequestOptions = mergeRequestOptions(
      {
        params: {
          ...mergedParams,
          ...(validateParams ? validateParams : {}),
        },
      },
      rest?.requestOptions,
    )

    const response = await model.get<T>(id, {
      path: rest?.path,
      query: rest?.query, // Now query type matches params type
      requestOptions: mergedRequestOptions,
    })

    if (response.data) {
      onSuccess?.(response.data)
    }

    return response
  }

  const createRaw = async <T = Partial<TEntity>, TVars = Partial<TEntity>>({
    payload,
    params,
    options,
    onSuccess,
  }: {
    payload?: TVars
    params?: QueryParams<T>
    options?: RequestOptions<T> // Generic options
    onSuccess?: (data: T) => void
  }) => {
    const { isEnabled, ...mergedParams } = mergeParams<T>(
      params,
      options?.requestOptions?.params,
    )
    const mergedRequestOptions = mergeRequestOptions(
      { params: mergedParams },
      options?.requestOptions,
    )

    const response = await model.create<T>(payload as Partial<TEntity>, {
      query: options?.query, // Now query type matches params type
      path: options?.path,
      requestOptions: mergedRequestOptions,
    })

    if (response.data) {
      onSuccess?.(response.data)
    }

    return response
  }

  const updateRaw = async <T = Partial<TEntity>, TVars = Partial<TEntity>>({
    id,
    payload,
    params,
    options,
    onSuccess,
  }: {
    id: Id
    payload: TVars
    params?: QueryParams<T>
    options?: RequestOptions<T> // Generic options
    onSuccess?: (data: T) => void
  }) => {
    const { isEnabled, ...mergedParams } = mergeParams<T>(
      params,
      options?.requestOptions?.params,
    )
    const mergedRequestOptions = mergeRequestOptions(
      { params: mergedParams },
      options?.requestOptions,
    )

    const response = await model.update<T>(
      id || '',
      payload as Partial<TEntity>,
      {
        path: options?.path,
        query: options?.query, // Now query type matches params type
        requestOptions: mergedRequestOptions,
      },
    )

    if (response.data) {
      onSuccess?.(response.data)
    }

    return response
  }

  const deleteRaw = async <T = Partial<TEntity>>({
    id,
    params,
    options,
    onSuccess,
  }: {
    id: Id
    params?: QueryParams<T>
    options?: RequestOptions<T> // Generic options
    onSuccess?: (data: T) => void
  }) => {
    const { isEnabled, ...mergedParams } = mergeParams<T>(
      params,
      options?.requestOptions?.params,
    )
    const mergedRequestOptions = mergeRequestOptions(
      { params: mergedParams },
      options?.requestOptions,
    )
    const response = await model.delete<T>(id, {
      path: options?.path,
      query: options?.query, // Now query type matches params type
      requestOptions: mergedRequestOptions,
    })

    if (response.data) {
      onSuccess?.(response.data)
    }

    return response
  }

  // ---------- Query Hook Factories ----------

  const createQueryHook = <S extends boolean>(suspense: S) =>
    suspense ? useSuspenseQuery : useQuery

  const createQueriesHook = <S extends boolean>(suspense: S) =>
    suspense ? useSuspenseQueries : useQueries

  const createInfiniteQueryHook = <S extends boolean>(suspense: S) =>
    suspense ? useSuspenseInfiniteQuery : useInfiniteQuery

  // ---------- List Hooks ----------

  const useListEntities = <
    Entity = TEntity,
    S extends boolean = false,
    Mode extends IPaginationModes | undefined = undefined,
  >(
    callOptions?: IListCallOptions<ReturnModel<TEntity, Entity>, S, Mode>,
    isSuspense: S = false as S,
  ) => {
    const params = mergeParams(callOptions?.params) as OffsetPaginationConfig<
      ReturnModel<TEntity, Entity>
    >
    const validateParams = validateFilters<any>({
      search: params.search,
      filters: params.filters,
      sorts: params.sorts,
    })
    const { isEnabled = true } = callOptions || {}
    const useHook = createQueryHook(isSuspense)

    return useHook({
      queryKey: buildQueryKey(
        params.entity,
        'list',
        ...(callOptions?.queryKey || []),
        params.limit,
        params.page,
        validateParams?.search,
        validateParams?.sort,
        validateParams?.filters,
      ),
      queryFn: async ({ signal }) => {
        const response = await listRaw<Entity>({
          params: {
            ...params,
            mode: 'offset',
            ...(validateParams ? validateParams : {}),
          },
          ...callOptions?.options,
          requestOptions: {
            ...(callOptions?.options?.requestOptions || {}),
            signal,
          },
        })
        callOptions?.onSuccess?.(response)
        return response
      },
      ...(isSuspense ? {} : { enabled: isEnabled }),
      ...filterSuspenseOptions(callOptions?.queryOptions, isSuspense),
    })
  }

  const useInfiniteListEntities = <Entity = TEntity, S extends boolean = false>(
    callOptions?: CursorCallOptions<ReturnModel<TEntity, Entity>, S>,
    isSuspense: S = false as S,
  ) => {
    const params = mergeParams(callOptions?.params) as CursorPaginationConfig<
      ReturnModel<TEntity, Entity>
    >
    const { isEnabled = true } = callOptions || {}

    const validateParams = validateFilters<any>({
      search: params.search,
      filters: params.filters,
      sorts: params.sorts,
    })
    const useHook = createInfiniteQueryHook(isSuspense)

    const select = (data: InfiniteListData<ReturnModel<TEntity, Entity>[]>) => {
      const items = data.pages.flatMap((page) => page.items || [])
      const paginationMeta =
        data.pages.length > 0
          ? data.pages[data.pages.length - 1].pagination_meta
          : getEmptyPaginationMeta({ limit: params.limit })

      const result: ListReturnType<ReturnModel<TEntity, Entity>[]> = {
        pagination_meta: paginationMeta,
        items,
        pageParams: data.pageParams,
        pages: data.pages as any,
      }

      callOptions?.onSuccess?.(result)
      return result
    }

    return useHook({
      queryKey: buildQueryKey(
        params.entity,
        'infinite-list',
        ...(callOptions?.queryKey || []),
        params.limit,
        params.cursor,
        validateParams?.search,
        validateParams?.sort,
        validateParams?.filters,
      ),
      queryFn: async ({ pageParam }) => {
        const cursorParams = pageParam ? { cursor: pageParam as string } : {}
        return await listRaw<Entity>({
          params: {
            ...params,
            ...cursorParams,
            mode: 'cursor',

            ...(validateParams ? validateParams : {}),
          },
          ...(callOptions?.options || {}),
        })
      },
      getNextPageParam: (lastPage) =>
        lastPage.pagination_meta?.next || undefined,
      initialPageParam: params.cursor,
      ...(isSuspense ? {} : { enabled: isEnabled }),
      ...filterSuspenseOptions(callOptions?.infiniteOptions, isSuspense),
      select: callOptions?.infiniteOptions?.select || select,
    })
  }

  // ---------- Single Entity Hooks ----------

  const useGetEntity = <Entity = TEntity, S extends boolean = false>(
    callOptions?: SingleQueryOptions<ReturnModel<TEntity, Entity>, S>,
    isSuspense: S = false as S,
  ) => {
    const params = mergeParams(callOptions?.params) as QueryParams<
      ReturnModel<TEntity, Entity>
    >
    const { isEnabled = true } = callOptions || {}

    const { entity } = params

    const validateParams = validateFilters<any>({
      search: params.search,
      filters: params.filters,
      sorts: params.sorts,
    })
    const { id } = { ...params, ...callOptions }
    const useHook = createQueryHook(isSuspense)
    const queryoptions = filterSuspenseOptions<
      SingleQueryOptions<ReturnModel<TEntity, Entity>, S>['queryOptions']
    >(callOptions?.queryOptions, isSuspense)
    return useHook({
      queryKey: buildQueryKey(
        entity,
        ...(callOptions?.queryKey || []),
        id,
        'get',

        validateParams?.search,
        validateParams?.sort,
        validateParams?.filters,
      ),
      queryFn: async ({ signal }) => {
        // if (id == null) throw new Error("ID is required for useGet");

        const response = await getRaw<ReturnModel<TEntity, Entity>>({
          id: (id as Id) || '',
          params: { ...params, ...(validateParams ? validateParams : {}) },
          ...(callOptions?.options || {}),
          requestOptions: {
            ...(callOptions?.options?.requestOptions || {}),
            signal,
          },
        })
        callOptions?.onSuccess?.(response)
        return response
      },
      ...(isSuspense ? {} : { enabled: isEnabled }),
      ...(queryoptions || {}),
    })
  }

  const useGetEntities = <Entity = TEntity, S extends boolean = false>(
    callOptions?: MultiQueryOptions<TEntity, Entity, S>,
    isSuspense: S = false as S,
  ) => {
    const params = mergeParams(callOptions?.params) as QueryParams<
      ReturnModel<TEntity, Entity>
    >
    const {
      ids = [],
      queryKey = [],
      queryOptions = {},
      isEnabled = true,
    } = callOptions || {}
    const queryoptions = filterSuspenseOptions<
      MultiQueryOptions<TEntity, Entity, S>['queryOptions']
    >(queryOptions, isSuspense)

    const useHook = createQueriesHook(isSuspense)

    return useHook({
      queries: (ids || [])?.map((id) => {
        return {
          queryKey: buildQueryKey(params.entity, 'get', id, ...queryKey),
          queryFn: async () => {
            if (id) {
              const res = await getRaw<ReturnModel<TEntity, Entity>>({
                id,
                params,
                ...(callOptions?.options || {}),
                requestOptions: {
                  ...(callOptions?.options?.requestOptions || {}),
                },
              })
              return res
            }
          },

          retry: false,
          ...(isSuspense ? {} : { enabled: isEnabled }),
          ...(queryoptions || {}),
        }
      }),
      combine: (results) => {
        const result = {
          data: results.map((r) => r.data),
          isLoading: results.some((r) => r.isLoading),
          isError: results.some((r) => r.isError),
          errors: results.map((r) => r.error),
        }
        callOptions?.onSuccess?.(result.data)
        return result
      },
    })
  }

  // ---------- Enhanced Mutation Hooks with Cache Management ----------

  const useCreate = <Entity = TEntity, TVars = Partial<TEntity>>(
    callOptions?: MutationCallOptions<ReturnModel<TEntity, Entity>, TVars>,
  ) => {
    const params = mergeParams(callOptions?.params) as QueryParams<
      ReturnModel<TEntity, Entity>
    >
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
          callOptions?.onSuccess?.(data.data)
        }

        if (callOptions?.invalidateQueries) {
          callOptions.invalidateQueries.forEach(({ queryKey, exact }) => {
            let key
            if (typeof queryKey == 'function') {
              key = queryKey(data.data, variables)
            } else {
              key = queryKey
            }
            queryClient.invalidateQueries({
              queryKey: buildQueryKey(params.entity, ...(key || [])),
              exact,
            })
          })
        }

        if (callOptions?.refetchQueries) {
          callOptions.refetchQueries.forEach(({ queryKey, exact }) => {
            let key
            if (typeof queryKey == 'function') {
              key = queryKey(data.data, variables)
            } else {
              key = queryKey
            }
            queryClient.refetchQueries({
              queryKey: [params.entity, ...(key || [])],
              exact,
            })
          })
        }

        callOptions?.mutationOptions?.onSuccess?.(
          data,
          variables,
          mutationResult,
          context,
        )
      },
      onMutate: async (variables, ctx) => {
        if (callOptions?.optimisticUpdate) {
          const { queryKey, updateFn } = callOptions.optimisticUpdate
          let qKey
          if (typeof queryKey == 'function') {
            qKey = queryKey(variables, ctx)
          } else {
            qKey = queryKey
          }
          const key = [params.entity, ...(qKey || [])]
          await queryClient.cancelQueries({ queryKey: key })

          const previousData = queryClient.getQueryData(key)
          queryClient.setQueryData(key, (old: any) => updateFn(old, variables))

          return { previousData }
        }

        return callOptions?.mutationOptions?.onMutate?.(variables, ctx)
      },
      onError: (error, variables, mutationResult, context) => {
        if (context && (context as any).previousData) {
          const { queryKey } = callOptions?.optimisticUpdate || {
            queryKey: [],
          }
          let key
          if (typeof queryKey == 'function') {
            key = queryKey(variables, context)
          } else {
            key = queryKey
          }
          if (key.length) {
            const qKey = [params.entity, ...(key || [])]
            queryClient.setQueryData(qKey, (context as any).previousData)
          }
        }

        callOptions?.mutationOptions?.onError?.(
          error,
          variables,
          mutationResult,
          context,
        )
      },
      ...callOptions?.mutationOptions,
    })
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
          | undefined,
      ) => {
        const res = await mutate.mutateAsync(variables, options)

        return res
      },
    )

    return { ...mutate, handleCreate }
  }

  const useUpdate = <Entity = TEntity, TVars = Partial<TEntity>>(
    callOptions?: MutationCallOptions<
      // { id: Id; data: TEntity & IPartialIfExist<Entity> },
      ReturnModel<TEntity, Entity>,
      { id: Id; data: TVars }
    >,
  ) => {
    const params = mergeParams(callOptions?.params) as QueryParams<
      ReturnModel<TEntity, Entity>
    >
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
          callOptions?.onSuccess?.(data.data)
        }
        if (variables?.id) {
          const entityKey = buildQueryKey(params?.entity, variables.id, 'get')
          queryClient.setQueryData(entityKey, (old: any) => {
            if (old && data.data) {
              return { ...old, data: { ...(old.data || {}), ...data.data } }
            }
            return old
          })
        }

        if (callOptions?.invalidateQueries) {
          callOptions.invalidateQueries.forEach(({ queryKey, exact }) => {
            let key
            if (typeof queryKey == 'function') {
              key = queryKey(data.data, variables)
            } else {
              key = queryKey
            }
            queryClient.invalidateQueries({
              queryKey: [params.entity, ...(key || [])],
              exact,
            })
          })
        }

        callOptions?.mutationOptions?.onSuccess?.(
          data,
          variables,
          mutationResult,
          context,
        )
      },
      onMutate: async (variables, ctx) => {
        if (callOptions?.optimisticUpdate) {
          const { queryKey, updateFn } = callOptions.optimisticUpdate
          let qKey
          if (typeof queryKey == 'function') {
            qKey = queryKey(variables, ctx)
          } else {
            qKey = queryKey
          }
          const key = [params.entity, ...(qKey || [])]
          await queryClient.cancelQueries({ queryKey: key })

          const previousData = queryClient.getQueryData(key)
          queryClient.setQueryData(key, (old: any) => updateFn(old, variables))

          return { previousData }
        }

        return callOptions?.mutationOptions?.onMutate?.(variables, ctx)
      },
      ...callOptions?.mutationOptions,
    })

    const handleUpdate = withErrorHandler(
      async (
        variables: {
          id: Id
          data: TVars
        },
        options?:
          | MutateOptions<
              IApiResponse<ReturnModel<TEntity, Entity>>,
              DefaultError,
              {
                id: Id
                data: TVars
              },
              unknown
            >
          | undefined,
      ) => {
        const res = await mutate.mutateAsync(variables, options)
        return res
      },
    )
    return { ...mutate, handleUpdate }
  }

  const useDelete = <Entity = TEntity>(
    callOptions?: MutationCallOptions<Entity, Id>,
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
          callOptions?.onSuccess?.(data.data)
        }

        const entityKey = buildQueryKey(opts?.defaultParams?.entity, id)
        queryClient.removeQueries({ queryKey: entityKey, exact: true })

        const listKey = buildQueryKey(opts?.defaultParams?.entity, 'list')
        queryClient.invalidateQueries({
          queryKey: listKey,
          refetchType: 'active',
        })

        callOptions?.mutationOptions?.onSuccess?.(
          data,
          id,
          mutationResult,
          context,
        )
      },
      ...callOptions?.mutationOptions,
    })
    const handleDelete = withErrorHandler(
      async (data?: {
        id?: Id
        options?: MutateOptions<ApiHooksResp<Entity>, DefaultError, Id, unknown>
      }) => {
        const res = await mutate.mutateAsync(data?.id, data?.options)

        return res
      },
    )

    return { ...mutate, handleDelete }
  }

  // ---------- Enhanced Cache Utilities ----------

  const updateCache = (
    id: Id,
    updates: Partial<TEntity>,
    queryKey?: QueryKey,
  ) => {
    const key = buildQueryKey(opts?.defaultParams?.entity, id, queryKey)
    queryClient.setQueryData(key, (old: TEntity | undefined) =>
      old ? { ...old, ...updates } : undefined,
    )
  }

  const invalidateCache = (queryKey?: QueryKey) => {
    const baseKey = opts?.defaultParams?.entity
      ? buildQueryKey(opts.defaultParams.entity)
      : []

    const fullKey = queryKey ? [...baseKey, ...queryKey] : baseKey
    return queryClient.invalidateQueries({ queryKey: fullKey })
  }

  const getUrl = (endpoint?: string) =>
    `${model.fullURL}${endpoint ? `/${endpoint}` : ''}`

  // ---------- Enhanced Prefetch Methods ----------

  const prefetchList = <
    Entity = TEntity,
    Mode extends IPaginationModes | undefined = undefined,
  >(
    callOptions?: IListCallOptions<ReturnModel<TEntity, Entity>, false, Mode>,
  ) => {
    const params = mergeParams(callOptions?.params) as OffsetPaginationConfig<
      ReturnModel<TEntity, Entity>
    >

    const validateParams = validateFilters<any>({
      search: params.search,
      filters: params.filters,
      sorts: params.sorts,
    })
    queryClient.prefetchQuery({
      queryKey: buildQueryKey(
        params.entity,
        'list',
        ...(callOptions?.queryKey || []),
        params.limit,
        params.page,

        validateParams?.search,
        validateParams?.sort,
        validateParams?.filters,
      ),
      queryFn: async ({ signal }) => {
        const response = await listRaw<Entity>({
          params: {
            ...params,
            mode: 'offset',

            ...(validateParams ? validateParams : {}),
          },
          ...(callOptions?.options || {}),
          requestOptions: {
            ...(callOptions?.options?.requestOptions || {}),
            signal,
          },
        })
        callOptions?.onSuccess?.(response)
        return response
      },

      ...(callOptions?.queryOptions || {}),
    })
  }

  const prefetchGet = <Entity = TEntity>(
    callOptions: SingleQueryOptions<ReturnModelType<TEntity, Entity>, false>,
  ) => {
    const params = mergeParams(callOptions?.params) as QueryParams<
      ReturnModel<TEntity, Entity>
    >

    const validateParams = validateFilters<any>({
      search: params.search,
      filters: params.filters,
      sorts: params.sorts,
    })
    queryClient.prefetchQuery({
      queryKey: buildQueryKey(
        params.entity,
        ...(callOptions.queryKey || []),
        callOptions.id,
        'get',
        validateParams?.search,
        validateParams?.sort,
        validateParams?.filters,
      ),
      queryFn: async ({ signal }) => {
        const response = await getRaw<ReturnModel<TEntity, Entity>>({
          id: callOptions.id as Id,
          params: {
            ...params,

            ...(validateParams ? validateParams : {}),
          },
          ...(callOptions?.options || {}),
          requestOptions: {
            ...(callOptions?.options?.requestOptions || {}),
            signal,
          },
        })
        callOptions.onSuccess?.(response)
        return response
      },
      ...(callOptions.queryOptions || {}),
    })
  }

  const prefetchInfiniteList = <Entity = TEntity>(
    callOptions?: CursorCallOptions<ReturnModel<TEntity, Entity>, false>,
  ) => {
    const params = mergeParams(callOptions?.params) as CursorPaginationConfig<
      ReturnModel<TEntity, Entity>
    >

    const validateParams = validateFilters<any>({
      search: params.search,
      filters: params.filters,
      sorts: params.sorts,
    })
    queryClient.prefetchInfiniteQuery({
      queryKey: buildQueryKey(
        params.entity,
        'infinite-list',
        ...(callOptions?.queryKey || []),
        params.limit,
        params.cursor,
        validateParams?.search,
        validateParams?.sort,
        validateParams?.filters,
      ),
      queryFn: async ({ pageParam }) => {
        const cursorParams = pageParam ? { cursor: pageParam as string } : {}
        return await listRaw<Entity>({
          params: {
            ...params,
            ...cursorParams,
            mode: 'cursor',

            ...(validateParams ? validateParams : {}),
          },
          ...(callOptions?.options || {}),
        })
      },
      initialPageParam: params.cursor,
      getNextPageParam: (
        lastPage: ApiHooksResp<ReturnModel<TEntity, Entity>[]>,
      ) => lastPage.pagination_meta?.next || undefined,
      ...(callOptions?.infiniteOptions || {}),
    })
  }

  const prefetchGetMany = <Entity = TEntity>(
    callOptions: MultiQueryOptions<TEntity, Entity, false> & { ids: Id[] },
  ) => {
    const params = mergeParams(callOptions.params) as QueryParams<
      ReturnModel<TEntity, Entity>
    >
    const { ids = [] } = callOptions || {}

    ids.forEach((id) =>
      queryClient.prefetchQuery({
        queryKey: buildQueryKey(
          params.entity,
          ...(callOptions.queryKey || []),
          id,
          'get',
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
          })
          return response
        },
        ...(callOptions.queryOptions || {}),
      }),
    )

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
  }

  const prefetchAll = <Entity = TEntity>(options?: {
    list?: IListCallOptions<ReturnModel<TEntity, Entity>, false>
    items?: Array<{
      id: Id
      options?: SingleQueryOptions<ReturnModel<TEntity, Entity>, false>
    }>
    infiniteList?: CursorCallOptions<ReturnModel<TEntity, Entity>, false>
  }) => {
    if (options?.list) {
      prefetchList(options.list)
    }

    if (options?.items) {
      options?.items.forEach((item) =>
        prefetchGet({ ...item.options, id: item.id }),
      )
    }

    if (options?.infiniteList) {
      prefetchInfiniteList(options.infiniteList)
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
  }

  // ---------- Query Hook Convenience Methods ----------

  const useSuspenseList = <
    Entity = TEntity,
    Mode extends IPaginationModes | undefined = undefined,
  >(
    opts?: IListCallOptions<ReturnModel<TEntity, Entity>, true, Mode>,
  ) => useListEntities(opts, true)

  const useList = <
    Entity = TEntity,
    Mode extends IPaginationModes | undefined = undefined,
  >(
    opts?: IListCallOptions<ReturnModel<TEntity, Entity>, false, Mode>,
  ) => useListEntities(opts)
  const useSuspenseInfiniteList = <Entity = TEntity>(
    opts?: CursorCallOptions<ReturnModel<TEntity, Entity>, true>,
  ) => useInfiniteListEntities(opts, true)

  const useInfiniteList = <Entity = TEntity>(
    opts?: CursorCallOptions<ReturnModel<TEntity, Entity>>,
  ) => useInfiniteListEntities(opts)

  const useSuspenseGet = <Entity = TEntity>(
    opts?: SingleQueryOptions<ReturnModel<TEntity, Entity>, true>,
  ) => useGetEntity(opts, true)

  const useGet = <Entity = TEntity>(
    opts?: SingleQueryOptions<ReturnModel<TEntity, Entity>>,
  ) => useGetEntity(opts)

  const useSuspenseGetMany = <Entity = TEntity>(
    opts?: MultiQueryOptions<TEntity, Entity, true>,
  ) => useGetEntities(opts, true)

  const useGetMany = <Entity = TEntity>(
    opts?: MultiQueryOptions<TEntity, Entity>,
  ) => useGetEntities(opts)

  // ---------- Public API ----------
  const listInfiniteParamsOptions = {} as CursorPaginationConfig<TEntity>
  const listParamsOptions = {} as OffsetPaginationConfig<TEntity>
  const listOptions: IListCallOptions<TEntity> = {}
  const listInfiniteOptions: ExtractHookOptions<typeof useInfiniteList> = {}
  const createOptions: ExtractHookOptions<
    typeof useCreate<TEntity, Partial<TEntity>>
  > = {}
  const deleteOptions: ExtractHookOptions<typeof useDelete<TEntity>> = {}
  const Entity: Partial<TEntity> = {}
  const TEntity = {} as TEntity

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
    TEntity,
  }
}
