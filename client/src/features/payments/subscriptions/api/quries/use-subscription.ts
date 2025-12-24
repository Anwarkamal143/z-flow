import { customerClient } from '@/models'
import { subscriptionQueryOptions } from './query-options'

export const useGetSubscriptions = (isEnabled = true) => {
  // Implementation to get customer state
  return customerClient.useGet({ ...subscriptionQueryOptions, isEnabled })
}

export const useGetSuspenseSubscriptions = (isEnabled = true) => {
  // Implementation to get customer state
  return customerClient.useSuspenseGet({
    ...subscriptionQueryOptions,
    isEnabled,
  })
}

export const useHasActiveSubscription = (
  isEnabled = true,
  useSuspense = false,
) => {
  const useHook = useSuspense
    ? useGetSuspenseSubscriptions
    : useGetSubscriptions
  const {
    data: customerState,
    isLoading: isSubscriptionLoading,
    ...rest
  } = useHook(isEnabled)
  const hasActiveSubscription =
    customerState?.data?.activeSubscriptions &&
    customerState.data.activeSubscriptions.length > 0

  return {
    hasExist: !!customerState?.data?.id,
    hasActiveSubscription,
    subscription: customerState?.data?.activeSubscriptions?.[0],
    isSubscriptionLoading,
    ...rest,
  }
}
