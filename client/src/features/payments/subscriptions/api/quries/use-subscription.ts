import { customerClient } from "@/models";
import { subscriptionQueryOptions } from "./query-options";

export const useGetSubscriptions = () => {
  // Implementation to get customer state
  return customerClient.useGet(subscriptionQueryOptions);
};

export const useGetSuspenseSubscriptions = () => {
  // Implementation to get customer state
  return customerClient.useSuspenseGet(subscriptionQueryOptions);
};

export const useHasActiveSubscription = (useSuspense = false) => {
  const {
    data: customerState,
    isLoading: isSubscriptionLoading,
    ...rest
  } = useSuspense ? useGetSuspenseSubscriptions() : useGetSubscriptions();
  const hasActiveSubscription =
    customerState?.data?.activeSubscriptions &&
    customerState.data.activeSubscriptions.length > 0;

  return {
    hasExist: !!customerState?.data?.id,
    hasActiveSubscription,
    subscription: customerState?.data?.activeSubscriptions?.[0],
    isSubscriptionLoading,
    ...rest,
  };
};
