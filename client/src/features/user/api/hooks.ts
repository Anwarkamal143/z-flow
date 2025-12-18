import { userClient } from '@/models'
import getQueryFn from '@/queries/useQueryFn'

export const useGetAllUsers = getQueryFn(userClient.useList)

export const useCursorGetAllUsers = getQueryFn(userClient.useInfiniteList)
