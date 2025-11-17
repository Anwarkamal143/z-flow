import { stripeClient } from "@/models";
import { StripeCustomer } from "../schema";

export function useListCustomers() {
  return stripeClient.useCursorList<StripeCustomer>({
    infiniteOptions: {
      initialPageParam: undefined
    },
    params: {
      limit: 1,
      cursor: undefined
    },
    options: {
      path: "customers"
    }
  });
}
