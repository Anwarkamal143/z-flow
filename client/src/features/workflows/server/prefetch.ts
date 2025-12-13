import { optionsWithCookies } from "@/lib";
import { workflowClient } from "@/models/v1/Workflow.model";
import { workflowListqueryOptions } from "../api/query-options";

export const prefetchServerWorkflows = (
  cookies?: string,
  props: typeof workflowClient.listOptions = {}
) => {
  const queryOptions = { ...workflowListqueryOptions, ...props };
  workflowClient.prefetchList({
    ...queryOptions,
    options: optionsWithCookies(queryOptions.options, cookies),
  });
};
