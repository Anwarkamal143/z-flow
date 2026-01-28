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
// Filter operators
export type FilterOperator = (typeof filterOperatorList)[number]

export interface FilterCondition<T = Record<string, any>> {
  column: keyof T
  operator: FilterOperator
  value?: any
}

export const FilterOperatorEnum = Object.fromEntries(
  filterOperatorList.map((op) => [op, op]),
) as { [K in (typeof filterOperatorList)[number]]: K }
// type FilterValueType = string | number | Date
type BaseFilterOps<V, T> = {
  eq(value: V): FilterCondition<T>
  neq(value: V): FilterCondition<T>
  isNull(): FilterCondition<T>
  isNotNull(): FilterCondition<T>
}

type ComparableFilterOps<V, T> = BaseFilterOps<V, T> & {
  gt(value: V): FilterCondition<T>
  gte(value: V): FilterCondition<T>
  lt(value: V): FilterCondition<T>
  lte(value: V): FilterCondition<T>
  between(from: V, to: V): FilterCondition<T>
  notBetween(from: V, to: V): FilterCondition<T>
}

type StringFilterOps<V, T> = ComparableFilterOps<V, T> & {
  like(value: V): FilterCondition<T>
  ilike(value: V): FilterCondition<T>
  in(values: V[]): FilterCondition<T>
  notIn(values: V[]): FilterCondition<T>
}

type BooleanFilterOps<V, T> = {
  eq(value: V): FilterCondition<T>
  neq(value: V): FilterCondition<T>
  isNull(): FilterCondition<T>
  isNotNull(): FilterCondition<T>
}
type ColumnValue<T> = Exclude<T, null | undefined>

export type FilterOps<V, T> =
  ColumnValue<V> extends string
    ? StringFilterOps<ColumnValue<V>, T>
    : ColumnValue<V> extends number | Date
      ? ComparableFilterOps<ColumnValue<V>, T>
      : ColumnValue<V> extends boolean
        ? BooleanFilterOps<ColumnValue<V>, T>
        : BaseFilterOps<ColumnValue<V>, T>

type FilterOpsImpl<V, T> = {
  eq(value: V): FilterCondition<T>
  neq(value: V): FilterCondition<T>

  gt(value: V): FilterCondition<T>
  gte(value: V): FilterCondition<T>
  lt(value: V): FilterCondition<T>
  lte(value: V): FilterCondition<T>

  like(value: V): FilterCondition<T>
  ilike(value: V): FilterCondition<T>

  in(values: V[]): FilterCondition<T>
  notIn(values: V[]): FilterCondition<T>

  between(from: V, to: V): FilterCondition<T>
  notBetween(from: V, to: V): FilterCondition<T>

  isNull(): FilterCondition<T>
  isNotNull(): FilterCondition<T>
}

function columnFilter<T, K extends keyof T>(column: K): FilterOpsImpl<T[K], T> {
  return {
    eq: (value) => ({ column, operator: 'eq', value }),
    neq: (value) => ({ column, operator: 'neq', value }),

    gt: (value) => ({ column, operator: 'gt', value }),
    gte: (value) => ({ column, operator: 'gte', value }),
    lt: (value) => ({ column, operator: 'lt', value }),
    lte: (value) => ({ column, operator: 'lte', value }),

    like: (value) => ({ column, operator: 'like', value }),
    ilike: (value) => ({ column, operator: 'ilike', value }),

    in: (values) => ({ column, operator: 'in', value: values }),
    notIn: (values) => ({ column, operator: 'notIn', value: values }),

    between: (from, to) => ({
      column,
      operator: 'between',
      value: [from, to],
    }),
    notBetween: (from, to) => ({
      column,
      operator: 'notBetween',
      value: [from, to],
    }),

    isNull: () => ({ column, operator: 'isNull' }),
    isNotNull: () => ({ column, operator: 'isNotNull' }),
  }
}
export const createFilter = <T>() =>
  new Proxy({} as { [K in keyof T]: FilterOps<T[K], T> }, {
    get: (_, prop: string) =>
      columnFilter<T, keyof T>(prop as keyof T) as FilterOps<T[keyof T], T>,
  })
