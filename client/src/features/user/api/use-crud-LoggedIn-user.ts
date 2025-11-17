import { userClient } from "@/models";
import { USER_PATHS, USER_QUERY } from "../paths";

export const useGetLoggedInUser = (isEnabled: boolean = true) => {
  return userClient.useGet<{ accessToken: string; refreshToken: string }>(
    USER_PATHS.me,
    {
      queryKey: [USER_QUERY.me],

      queryOptions: {
        enabled: !!isEnabled,
        staleTime: 60 * 1000
      }
    }
  );
};
