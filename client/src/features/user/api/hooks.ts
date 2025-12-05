import { userClient } from "@/models";
import useQueryFn from "@/queries/useQueryFn";

export const useGetAllUsers = useQueryFn(userClient.useList);

export const useCursorGetAllUsers = useQueryFn(userClient.useInfiniteList);
