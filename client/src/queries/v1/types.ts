/* =============================
   Enhanced CRUD Client Factory
   ============================= */

import { IRequestOptions } from '@/models'
import {
  IApiResponse,
  IApiResponseHooks,
  IPaginatedReturnType,
  IPaginationMeta,
  IResponseError,
  ReturnModelType,
} from '@/types/Iquery'
import {
  InfiniteData,
  MutationFunctionContext,
  QueryKey,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
  UseSuspenseInfiniteQueryOptions,
  UseSuspenseQueryOptions,
} from '@tanstack/react-query'

/* -----------------------
   Core Types
   ----------------------- */
const filterOperatorList = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'like',
  'ilike',
  'in',
  'notIn',
  'isNull',
  'isNotNull',
  'between',
  'notBetween',
] as const

export const FilterOperatorEnum = Object.fromEntries(
  filterOperatorList.map((op) => [op, op]),
) as { [K in (typeof filterOperatorList)[number]]: K }
type ExtractHookParams<T> = T extends (...args: infer P) => any ? P : never

// Extract the first parameter type from a hook function
export type ExtractHookOptions<T> = T extends (...args: any) => any
  ? ExtractHookParams<T>[0]
  : never

export type Id = string | number | undefined
export type SortOrder = 'asc' | 'desc'
export type DefaultError = IResponseError<null>
export type ReturnModel<TEntity, Entity> = ReturnModelType<TEntity, Entity>
export type ApiHooksResp<T> = IApiResponseHooks<T>

export type BaseParams = {
  entity?: string
  [key: string]: any
}
/* -----------------------
   Parameter Types
   ----------------------- */

//  new Types
export type SortDirection = 'asc' | 'desc'
export type IPaginationModes = 'cursor' | 'offset'

// Filter operators
export type FilterOperator =
  (typeof FilterOperatorEnum)[keyof typeof FilterOperatorEnum]

export interface FilterCondition<T = Record<string, any>> {
  column: keyof T
  operator: FilterOperator
  value: any
}

export interface SortConfig<T = Record<string, any>> {
  column: keyof T
  direction: SortDirection
  nulls?: 'first' | 'last'
}

export interface SearchConfig<T = Record<string, any>> {
  columns: (keyof T)[]
  term: string
  mode?: 'any' | 'all' | 'phrase'
}

// Pagination base config
export type BasePaginationConfig<T = Record<string, any>> = BaseParams & {
  filters?: FilterCondition<T>[] | string | null
  search?: SearchConfig<T> | string | null
  sorts?: SortConfig<T>[] | string | null
  includeTotal?: boolean
}

// Offset pagination config
export type OffsetPaginationConfig<T = Record<string, any>> =
  BasePaginationConfig<T> & {
    page?: number
    limit?: number
  }

// Cursor pagination config
export type CursorPaginationConfig<T = Record<string, any>> =
  BasePaginationConfig<T> & {
    cursor?: string | number | null
    limit?: number
    // cursorColumn: keyof T;
    cursorDirection?: 'forward' | 'backward'
  }
export type QueryParams<T = Record<string, any>> = BasePaginationConfig<T> &
  (
    | (CursorPaginationConfig<T> & { mode: 'cursor' })
    | (OffsetPaginationConfig<T> & { mode: 'offset' })
    | { mode?: undefined }
  )
/* -----------------------
Request Options
----------------------- */

export type RequestOptions<T = Record<string, any>> = {
  query?: QueryParams<T> // Make query match params type
  path?: string
  requestOptions?: Partial<IRequestOptions>
}

export type CallOptions<T = Record<string, any>> = {
  // params?: QueryParams<T>;
  options?: RequestOptions<T> // Use generic RequestOptions
  queryKey?: QueryKey
  isEnabled?: boolean
} & {
  params?: Partial<Record<keyof T, any>>
}

/* -----------------------
   Response Types
   ----------------------- */

export type ListData<T> = { items: T; pagination_meta: IPaginationMeta }
export type InfiniteListData<T> = InfiniteData<ListData<T>, unknown>

export type ListReturnType<T> = {
  pagination_meta: IPaginationMeta | undefined
  items: T
  pageParams: unknown[]
  pages: { items: T; pagination_meta: IPaginationMeta }[]
}

/* -----------------------
   Query Option Types
   ----------------------- */

type QueryOptions<T, S extends boolean, ErrorT = DefaultError> = S extends true
  ? UseSuspenseQueryOptions<ApiHooksResp<T>, ErrorT, ListData<T>, QueryKey>
  : UseQueryOptions<ApiHooksResp<T>, ErrorT, ListData<T>, QueryKey>

type InfiniteQueryOptions<
  T,
  S extends boolean,
  ErrorT = DefaultError,
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
    >

/* -----------------------
   Operation Options
   ----------------------- */

type CommonListOptions<T, S extends boolean = false, ErrorT = DefaultError> = {
  options?: RequestOptions<T> // Use generic RequestOptions
  queryOptions?: Omit<QueryOptions<T[], S, ErrorT>, 'queryKey'>
  queryKey?: QueryKey
  isEnabled?: boolean
}

export type ListCallOptions<
  T,
  S extends boolean = false,
  ErrorT = DefaultError,
> = CommonListOptions<T, S, ErrorT> & {
  infiniteOptions?: Partial<
    Omit<InfiniteQueryOptions<T[], S, ErrorT>, 'queryKey'>
  >
  getNextPageParam?: InfiniteQueryOptions<T[], S, ErrorT>['getNextPageParam']
  onSuccess?: (data: ListReturnType<T[]>) => void
}

export type CursorCallOptions<
  T,
  S extends boolean = false,
  ErrorT = DefaultError,
> = {
  params?: CursorPaginationConfig<T>
  onSuccess?: (data: ListReturnType<T[]>) => void
} & ListCallOptions<T, S, ErrorT>

export type IListCallOptions<
  T,
  S extends boolean = false,
  Mode extends IPaginationModes | undefined = undefined,
  ErrorT = DefaultError,
> = CommonListOptions<T, S, ErrorT> & {
  mode?: Mode

  params?: Mode extends 'offset'
    ? OffsetPaginationConfig<T>
    : Mode extends 'cursor'
      ? CursorPaginationConfig<T>
      : QueryParams<T>
  onSuccess?: (data: IPaginatedReturnType<T[]>) => void
}

/* -----------------------
   Enhanced Mutation Types
   ----------------------- */

export type MutationCallOptions<
  TData = any,
  TVars = any,
  ErrorT = DefaultError,
> = {
  params?: QueryParams<TData>
  options?: RequestOptions<TData> // Use generic RequestOptions
  mutationOptions?: UseMutationOptions<IApiResponse<TData>, ErrorT, TVars>
  onSuccess?: (data: TData) => void
  invalidateQueries?: {
    queryKey: QueryKey | ((data?: TData, params?: TVars) => QueryKey)
    exact?: boolean
  }[]
  refetchQueries?: {
    queryKey: QueryKey | ((data?: TData, params?: TVars) => QueryKey)
    exact?: boolean
  }[]
  optimisticUpdate?: {
    queryKey:
      | QueryKey
      | ((vars?: TVars, ctx?: MutationFunctionContext) => QueryKey)
    updateFn: (oldData: any, newData: TVars) => any
  }
}

type CommonQueryOptions<
  TEntity,
  Entity,
  S extends boolean = false,
  ErrorT = DefaultError,
> = {
  queryOptions?: S extends true
    ? Omit<
        UseSuspenseQueryOptions<
          ApiHooksResp<ReturnModel<TEntity, Entity>>,
          ErrorT,
          ApiHooksResp<ReturnModel<TEntity, Entity>>,
          QueryKey
        >,
        'queryKey'
      >
    : Omit<
        UseQueryOptions<
          ApiHooksResp<ReturnModel<TEntity, Entity>>,
          ErrorT,
          ApiHooksResp<ReturnModel<TEntity, Entity>>,
          QueryKey
        >,
        'queryKey'
      >
}

export type SingleQueryOptions<
  TEntity,
  Entity,
  S extends boolean = false,
  ErrorT = DefaultError,
> = CallOptions<ReturnModel<TEntity, Entity>> & {
  id?: Id
  onSuccess?: (data: ApiHooksResp<ReturnModel<TEntity, Entity>>) => void
} & CommonQueryOptions<TEntity, Entity, S, ErrorT>

export type MultiQueryOptions<
  TEntity,
  Entity,
  S extends boolean = false,
  ErrorT = DefaultError,
> = CallOptions<ReturnModel<TEntity, Entity>> & {
  ids?: Id[]
  onSuccess?: (
    data: (ApiHooksResp<ReturnModel<TEntity, Entity>> | undefined)[],
  ) => void
} & CommonQueryOptions<TEntity, Entity, S, ErrorT>

/* -----------------------
   Factory Options
   ----------------------- */

export type CrudFactoryOptions<
  TParams = Record<string, any>,
  Prefix = string,
> = {
  defaultParams?: TParams & { entity: Prefix }
}

// export type PrefetchOptions<Mode extends IPaginationModes, TEntity, Entity> = {
//   list?: IListCallOptions<ReturnModel<TEntity, Entity>[], false, Mode>;
//   items?: Array<{
//     id: Id;
//     options?: SingleQueryOptions<TEntity, Entity, false>;
//   }>;
//   infiniteList?: CursorCallOptions<ReturnModel<TEntity, Entity>, false>;
// };
