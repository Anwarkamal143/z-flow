import { userClient } from "@/models";
import useQueryFn from "@/queries/useQueryFn";
import { USER_PATHS, USER_QUERY } from "../paths";

export const useGetLoggedInUser = useQueryFn(
  userClient.useGet<{ accessToken: string; refreshToken: string }>,
  {
    id: USER_PATHS.me,
    queryKey: [USER_QUERY.me],
    queryOptions: {
      staleTime: 60 * 1000,
    },
  }
);
