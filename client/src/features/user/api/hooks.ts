import { IUserHooksTypes, userClient } from "@/models";

export const useGetAllUsers = (
  props: IUserHooksTypes["listParamsOptions"] = {}
) => {
  return userClient.useList({
    params: {
      mode: "offset",
      limit: 1,
      page: 0,
      ...props,
    },
  });
};
export const useCursorGetAllUsers = (isEnabled: boolean = true) => {
  return userClient.useInfiniteList({
    params: {
      limit: 1,
      mode: "cursor",
    },

    queryKey: ["all_users"],
  });
};
