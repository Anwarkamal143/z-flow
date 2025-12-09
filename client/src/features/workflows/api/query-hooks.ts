"use client";
import { workflowClient } from "@/models/v1/Workflow.model";
import { useListHook, useSuspenseListHook } from "@/queries/useList";
import { workflowListqueryOptions } from "./query-options";

export const useGetAllWorkflows = (
  props: typeof workflowClient.listOptions
) => {
  return useListHook(workflowClient, { ...workflowListqueryOptions, ...props });
};
export const useSuspenseGetAllWorkflows = (
  props: typeof workflowClient.listOptions
) => {
  return useSuspenseListHook(workflowClient, {
    ...workflowListqueryOptions,
    ...props,
  });
};
