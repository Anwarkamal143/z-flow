import { withErrorHandler } from "@/lib";
import { stripeClient } from "@/models";
import { StripeCreateCustomer } from "../schema";

export function useCreateCustomer() {
  const { mutateAsync, isError, isPending, isSuccess, error } =
    stripeClient.usePost<never, StripeCreateCustomer>({
      options: {
        path: "customers"
      }
    });

  const handleCreateCustomer = withErrorHandler(
    async (data: Partial<StripeCreateCustomer>) => {
      const res = await mutateAsync({
        ...data
      });

      return res;
    }
  );
  return { handleCreateCustomer, isError, isPending, isSuccess, error };
}
