import { userClient } from "@/models";
export const useGetAllUsers = (isEnabled: boolean = true) => {
  return userClient.useList({});
};
export const useCursorGetAllUsers = (isEnabled: boolean = true) => {
  return userClient.useInfiniteList({
    params: {
      limit: 1000,
    },

    queryKey: ["all_users"],
  });
};
