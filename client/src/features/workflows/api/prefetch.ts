import { optionsWithCookies } from "@/lib";
import { workflowClient } from "@/models/v1/Workflow.model";
import { workflowListqueryOptions } from "./query-options";

export const prefetchWorkflows = (cookies?: string) => {
  const queryOptions = { ...workflowListqueryOptions };
  workflowClient.prefetchList({
    ...queryOptions,
    options: optionsWithCookies(queryOptions.options, cookies),
  });
};
