type SearchMode = 'any' | 'all' | 'phrase'
type SearchableValue = string | number | Date

type SearchableKeys<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends SearchableValue ? K : never
}[keyof T]

export interface SearchConfig<T = Record<string, any>> {
  columns: SearchableKeys<T>[]
  term: string
  mode?: SearchMode
}

// Updated SearchBuilder to include both single-column methods and a columns method
type SearchBuilder<T> = {
  [K in SearchableKeys<T>]: {
    term(term: string, mode?: SearchMode): SearchConfig<T>
  }
} & {
  columns(
    columns: SearchableKeys<T>[],
    term: string,
    mode?: SearchMode,
  ): SearchConfig<T>
}

// export interface SearchConfig<T = Record<string, any>> {
//   columns: (keyof T)[]
//   term: string
//   mode?: SearchMode
// }

function search<T>(
  columns: SearchableKeys<T>[],
  term: string,
  mode: SearchMode = 'any',
): SearchConfig<T> {
  return { columns, term, mode }
}

export function createSearch<T>(): SearchBuilder<T> {
  const handler: ProxyHandler<SearchBuilder<T>> = {
    get: (target, prop: string | symbol) => {
      // Handle the columns method
      if (prop === 'columns') {
        return (
          columns: SearchableKeys<T>[],
          term: string,
          mode: SearchMode = 'any',
        ) => ({
          columns,
          term,
          mode,
        })
      }

      // Handle single-column properties
      if (typeof prop === 'string') {
        return {
          term: (term: string, mode: SearchMode = 'any') => ({
            columns: [prop as SearchableKeys<T>],
            term,
            mode,
          }),
        }
      }

      // Fallback for symbols or other property types
      return (target as any)[prop]
    },
  }

  return new Proxy({} as SearchBuilder<T>, handler)
}

// Alternative implementation if you want to keep it purely proxy-based
export function createSearchAlt<T>(): SearchBuilder<T> {
  return new Proxy({} as any, {
    get: (target, prop: string) => {
      // Handle the columns method
      if (prop === 'columns') {
        return (
          columns: SearchableKeys<T>[],
          term: string,
          mode: SearchMode = 'any',
        ) => ({
          columns,
          term,
          mode,
        })
      }

      // Handle single-column properties
      return {
        term: (term: string, mode: SearchMode = 'any') => ({
          columns: [prop as SearchableKeys<T>],
          term,
          mode,
        }),
      }
    },
  })
}
