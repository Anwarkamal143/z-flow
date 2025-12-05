import { HttpStatusCode } from "@/config/http.config";
import { AxiosResponse } from "axios";
export type CustomResponse = {
  success?: boolean;
  errorHandled?: boolean;
  reason?: string;
  message?: string;
} & Partial<AxiosResponse>;
// type IPartialIfExist<T> = T extends never ? never : Partial<T>;
// type IPartialIfExistElseUnknown<T> = T extends never ? unknown : Partial<T>;
// type IBIfNotA<A, B> = A extends never ? B : A;
type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false;
export type ApiResponse<T> = {
  data: T;
  cursor?: { [key: string]: string } | string | number;
  [key: string]: unknown;
};
export type IPaginationMeta = {
  next?: number | string | undefined;
  previous?: number | string | undefined;
  totalRecords: number;
  totalPages: number;
  limit?: number;
  current?: number | string;
  isFirst?: boolean;
  isLast?: boolean;
  direction?: "next" | "prev";
  hasMore?: boolean;
};
export type ICommon<T> = {
  message: string;
  data?: T;
  extra?: T | any;
  success?: true | false;
  status: HttpStatusCode;
  time: number;
};
export type IApiResponse<T> = ICommon<T> & {
  cursor?: { [key: string]: string } | string | number;
  metadata?: { [key: string]: string } | string | number;
  pagination_meta?: IPaginationMeta;
  [key: string]: unknown;
};
export type IApiResponse1<T> = T & {
  cursor?: { [key: string]: string } | string | number;
  metadata?: { [key: string]: string } | string | number;
  pagination_meta?: IPaginationMeta;
  [key: string]: unknown;
};
export type ISingleApiResponse<T> = T & {
  [key: string]: unknown;
};

export type IResponseError<T = never> = Omit<
  CustomResponse,
  "data" | "errorHandled" | "headers" | "request"
> & {
  data: ICommon<T>;
};
export type UnionIfBPresent<A, B> = [B] extends [never] ? A : A & B;
export type ReturnModelType<A, B> = [B] extends [never]
  ? A
  : HasKey<B, "replace_type"> extends true
  ? B
  : UnionIfBPresent<A, B>;
