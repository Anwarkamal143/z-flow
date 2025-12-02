import { ICustomerHooksTypes } from "@/models";
export const CUSTOMER_QUERY_KEYS = {
  state: "customer-subscriptions",
};
export const subscriptionQueryOptions: ICustomerHooksTypes["GetSuspenseQueryOptions"] =
  {
    id: "state",
    queryKey: [CUSTOMER_QUERY_KEYS.state],
  };
