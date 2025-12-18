import { getOptionsWithCookies } from '@/lib/auth/server-utils'
import { customerClient } from '@/models'
import { subscriptionQueryOptions } from './query-options'
export const prefetchSubscriptions = async () => {
  const queryOptions = { ...subscriptionQueryOptions }
  const cookiesOptions = await getOptionsWithCookies(queryOptions?.options)
  return customerClient.prefetchGet({
    ...queryOptions,

    options: cookiesOptions,
  })
}
