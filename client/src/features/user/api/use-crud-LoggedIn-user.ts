import { userClient } from '@/models'
import getQueryFn from '@/queries/useQueryFn'
import { USER_PATHS, USER_QUERY } from '../paths'

export const useGetLoggedInUser = getQueryFn(
  userClient.useGet<{ accessToken: string; refreshToken: string }>,
  {
    id: USER_PATHS.me,
    queryKey: [USER_QUERY.me],
    queryOptions: {
      staleTime: 60 * 1000,
    },
  },
)
