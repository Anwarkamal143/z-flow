// type IPartialIfExist<T> = T extends never ? never : Partial<T>;
// type IPartialIfExistElseUnknown<T> = T extends never ? unknown : Partial<T>;
// type IBIfNotA<A, B> = A extends never ? B : A;
type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false;
export type ApiResponse<T> = {
  data: T;
  cursor?: { [key: string]: string } | string | number;
  [key: string]: unknown;
};

export type UnionIfBPresent<A, B> = [B] extends [never | any] ? A : A & B;
