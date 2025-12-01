import { userClient } from "@/models";
import { USER_PATHS, USER_QUERY } from "../paths";

export const useGetLoggedInUser = (isEnabled: boolean = true) => {
  return userClient.useGet<{ accessToken: string; refreshToken: string }>({
    id: USER_PATHS.me,
    queryKey: [USER_QUERY.me],
    params: {
      isEnabled: isEnabled,
    },
    queryOptions: {
      staleTime: 60 * 1000,
    },
  });
};
