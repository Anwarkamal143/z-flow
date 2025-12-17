"use client";
import { workflowClient, WorkflowClientListOptions } from "@/models";
import {
  useOffsetPaginationList,
  useSuspnseOffsetPagination,
} from "@/queries/pagination/hooks";
import useQueryFn from "@/queries/useQueryFn";
import { IListCallOptions } from "@/queries/v1/types";
import { workflowListqueryOptions } from "./query-options";

export const useOffsetGetAllWorkflows = (
  props: WorkflowClientListOptions<"offset">
) => {
  return useOffsetPaginationList(workflowClient, {
    ...workflowListqueryOptions,
    ...props,
  });
};

export const useSuspenseOffsetWorkflows = <
  T extends Omit<
    IListCallOptions<Partial<IWorkflow>, false, "offset">,
    "mode"
  > = Omit<IListCallOptions<Partial<IWorkflow>, false, "offset">, "mode">
>(
  props?: T
) => {
  const mode = "offset";
  return useSuspnseOffsetPagination(workflowClient, {
    ...workflowListqueryOptions,
    ...props,
    mode,
    params: {
      includeTotal: true,
      ...(props?.params || {}),
      mode,
    },
  });
};
export const useSuspenseCursorListWorkflows = useQueryFn(
  workflowClient.useInfiniteList
);
