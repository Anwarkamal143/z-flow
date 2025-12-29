import { ErrorCode } from '@/lib/error-code.enum'
import { CustomResponse } from '@/lib/request'
type IPartialIfExist<T> = T extends never ? never : Partial<T>
type IPartialIfExistElseUnknown<T> = T extends never ? unknown : Partial<T>
type IBIfNotA<A, B> = A extends never ? B : A
type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false
// type ApiResponse<T> = {
//   data: T;
//   cursor?: { [key: string]: string } | string | number;
//   [key: string]: unknown;
// };
type IPaginationMeta = {
  isFirst?: boolean
  isLast?: boolean
  current?: number | string
  next?: number | string
  previous?: number | string
  totalRecords: number
  totalPages: number
  limit: number
  direction?: 'forward' | 'backward' | null
  hasMore?: boolean
}

type ICommon<T> = {
  message: string
  data?: T
  extra?: T | any
  success?: true | false
  status: number
  time: number
  errorCode?: keyof typeof ErrorCode
}
type IApiResponse<T> = ICommon<T> & {
  cursor?: { [key: string]: string } | string | number
  metadata?: { [key: string]: string } | string | number
  pagination_meta?: IPaginationMeta
  [key: string]: unknown
}
type IApiResponseHooks<T> = Omit<ICommon<T>, 'status' | 'time' | 'message'> & {
  cursor?: { [key: string]: string } | string | number
  metadata?: { [key: string]: string } | string | number
  pagination_meta?: IPaginationMeta
  [key: string]: unknown
}
type IPaginatedReturnType<T> = {
  items: T
  pagination_meta: IPaginationMeta
}
type IResponseError<T = never> = Omit<
  CustomResponse,
  'errorHandled' | 'headers' | 'request'
> & {
  data: ICommon<T>
}
type Merge<A, B> = Omit<A, keyof B> & B

type UnionIfBPresent<A, B> = [B] extends [never] ? A : Merge<A, B>

type ReturnModelType<A, B> = [B] extends [never] ? A : Merge<A, B>
// type ApiModelKey = keyof typeof ApiModelMapping;
// type WithType<L extends keyof typeof ApiModelMapping, M> = [M] extends [never]
//   ? ApiModelDataTypes[L]
//   : ApiModelDataTypes[L] & M;
type ExtractHookParams<T> = T extends (...args: infer P) => any ? P : never

// Extract the first parameter type from a hook function
type ExtractHookOptions<T> = T extends (...args: any) => any
  ? ExtractHookParams<T>[0]
  : never
