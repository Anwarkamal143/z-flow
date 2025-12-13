"use client";
import { workflowClient } from "@/models/v1/Workflow.model";
import {
  useOffsetPaginationList,
  useSuspenseOffsetPaginationList,
} from "@/queries/pagination/hooks/useList";
import useQueryFn from "@/queries/useQueryFn";
import { workflowListqueryOptions } from "./query-options";

export const useGetAllWorkflows = (
  props: typeof workflowClient.listOptions
) => {
  return useOffsetPaginationList(workflowClient, {
    ...workflowListqueryOptions,
    ...props,
  });
};
export const useSuspenseWorkflows = (
  props: typeof workflowClient.listOptions = {}
) => {
  return useSuspenseOffsetPaginationList(workflowClient, {
    ...workflowListqueryOptions,
    ...props,
  });
};
export const useSuspenseCursorListWorkflows = useQueryFn(
  workflowClient.useInfiniteList
);
