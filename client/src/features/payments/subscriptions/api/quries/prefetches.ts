import { getOptionsWithCookies } from "@/lib/auth/server-utils";
import { customerClient } from "@/models";
import { subscriptionQueryOptions } from "./query-options";
console.log(getOptionsWithCookies());
export const prefetchSubscriptions = async () => {
  const queryOptions = { ...subscriptionQueryOptions };
  const cookiesOptions = await getOptionsWithCookies(queryOptions?.options);
  customerClient.prefetchGet({
    ...subscriptionQueryOptions,

    options: cookiesOptions,
  });
};
