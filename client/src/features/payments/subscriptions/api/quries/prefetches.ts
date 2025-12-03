import { getOptionsWithCookies } from "@/lib/auth/server-utils";
import { customerClient } from "@/models";
import { subscriptionQueryOptions } from "./query-options";

export const prefetchSubscriptions = async () => {
  const queryOptions = { ...subscriptionQueryOptions };
  customerClient.prefetchGet({
    ...subscriptionQueryOptions,

    options: await getOptionsWithCookies(queryOptions?.options),
  });
};
