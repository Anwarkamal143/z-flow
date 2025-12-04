"use client";

import { useHasActiveSubscription } from "@/features/payments/subscriptions";

type Props = {};

const Workflows = (props: Props) => {
  const { subscription, isSubscriptionLoading, error, isError } =
    useHasActiveSubscription(true);

  console.log(isSubscriptionLoading, "isSubscriptionLoading");

  return (
    <div>
      {JSON.stringify(subscription, null, 2)} - {isSubscriptionLoading}
    </div>
  );
};

export default Workflows;
