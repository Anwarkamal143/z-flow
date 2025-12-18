import { getQueryClient } from '@/get-query-client'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { ReactNode } from 'react'

/**
 * Hydration wrapper component (server -> client)
 */
export function HydrateClient(props: { children: ReactNode }) {
  const queryClient = getQueryClient()

  // Add error boundary for dehydrate
  let dehydratedState
  try {
    dehydratedState = dehydrate(queryClient)
  } catch (error) {
    console.error('Error during dehydration:', error)
    // Return children without hydration in case of error
    return <>{props.children}</>
  }

  return (
    <HydrationBoundary state={dehydratedState}>
      {props.children}
    </HydrationBoundary>
  )
}

// Extract proper types from QueryClient methods
type PrefetchQueryOptions = Parameters<QueryClient['prefetchQuery']>[0]
type PrefetchInfiniteQueryOptions = Parameters<
  QueryClient['prefetchInfiniteQuery']
>[0]

// Type guards for better type safety
function isPrefetchInfiniteQueryOptions(
  options:
    | PrefetchQueryOptions
    | (PrefetchInfiniteQueryOptions & { isInfinite?: boolean }),
): options is PrefetchInfiniteQueryOptions & { isInfinite: true } {
  return (options as any).isInfinite === true
}

function isPrefetchQueryOptions(
  options:
    | PrefetchQueryOptions
    | (PrefetchInfiniteQueryOptions & { isInfinite?: boolean }),
): options is PrefetchQueryOptions & { isInfinite?: false } {
  return (options as any).isInfinite !== true
}

// Discriminated union for type-safe options
export type QueryOptions =
  | { isInfinite?: false; query: PrefetchQueryOptions }
  | { isInfinite: true; query: PrefetchInfiniteQueryOptions }

/**
 * Prefetch helper that routes to prefetchQuery or prefetchInfiniteQuery
 * depending on the isInfinite flag.
 */
export function prefetch<T extends QueryOptions>(options: T): void {
  const queryClient = getQueryClient()

  try {
    if (options.isInfinite) {
      // TypeScript now knows this is PrefetchInfiniteQueryOptions
      void queryClient.prefetchInfiniteQuery(options.query)
    } else {
      // TypeScript now knows this is PrefetchQueryOptions
      void queryClient.prefetchQuery(options.query)
    }
  } catch (error) {
    console.error('Error during prefetch:', error)
    // Optionally rethrow or handle as needed
    throw error
  }
}

// Alternative version with backward compatibility
export type IQueryOptions =
  | (PrefetchQueryOptions & { isInfinite?: false | undefined })
  | (PrefetchInfiniteQueryOptions & { isInfinite: true })

/**
 * Backward compatible prefetch function
 */
export function prefetchLegacy(options: IQueryOptions): void {
  const queryClient = getQueryClient()

  try {
    if (options.isInfinite) {
      const { isInfinite: _, ...queryOptions } = options
      void queryClient.prefetchInfiniteQuery(
        queryOptions as PrefetchInfiniteQueryOptions,
      )
    } else {
      const { isInfinite: _, ...queryOptions } = options
      void queryClient.prefetchQuery(queryOptions as PrefetchQueryOptions)
    }
  } catch (error) {
    console.error('Error during prefetch:', error)
    throw error
  }
}
