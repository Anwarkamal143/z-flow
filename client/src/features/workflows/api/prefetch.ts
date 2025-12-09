import { optionsWithCookies } from "@/lib";
import { workflowClient } from "@/models/v1/Workflow.model";
import { workflowListqueryOptions } from "./query-options";

export const prefetchWorkflows = async (cookies?: string) => {
  const queryOptions = { ...workflowListqueryOptions };
  return await workflowClient.prefetchList({
    ...queryOptions,
    options: await optionsWithCookies(queryOptions.options, cookies),
  });
};
