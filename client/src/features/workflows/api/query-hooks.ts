"use client";
import {
  WorkFlowClient,
  workflowClient,
  WorkFlowClientEntity,
  WorkflowClientListOptions,
} from "@/models";
import {
  IuseSuspenseCursorPaginationType,
  IuseSuspenseOffSetPaginationType,
  useOffsetPaginationList,
  useSuspensePagination,
} from "@/queries/pagination/hooks";
import useQueryFn from "@/queries/useQueryFn";
import { IPaginationModes } from "@/queries/v1";
import { workflowListqueryOptions } from "./query-options";

export const useOffsetGetAllWorkflows = (
  props: WorkflowClientListOptions<"offset">
) => {
  return useOffsetPaginationList(workflowClient, {
    ...workflowListqueryOptions,
    ...props,
  });
};

type IMode<T> = T extends undefined ? "offset" : T;
export const useSuspenseWorkflows = <
  Mode extends IPaginationModes | undefined,
  T extends WorkflowClientListOptions<
    IMode<Mode>,
    true
  > = WorkflowClientListOptions<IMode<Mode>, true>
>(
  props: T & {
    mode?: Mode;
  }
) => {
  const mode = (props?.mode || props?.params?.mode || "offset") as Mode;
  const result = useSuspensePagination(workflowClient, {
    ...workflowListqueryOptions,
    ...props,
    mode,
    params: {
      ...(props?.params || {}),
      mode,
    },
  });
  // return result;
  return result as Mode extends "cursor"
    ? IuseSuspenseCursorPaginationType<WorkFlowClient, WorkFlowClientEntity>
    : IuseSuspenseOffSetPaginationType<WorkFlowClient, WorkFlowClientEntity>;
};
export const useSuspenseCursorListWorkflows = useQueryFn(
  workflowClient.useInfiniteList
);
