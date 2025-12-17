import { optionsWithCookies } from "@/lib";
import {
  workflowClient,
  WorkflowClientListOptions,
} from "@/models/v1/Workflow.model";
import { workflowListqueryOptions } from "../api/query-options";

export const prefetchServerWorkflows = (
  cookies?: string,
  props: WorkflowClientListOptions = {}
) => {
  const queryOptions = { ...workflowListqueryOptions, ...props };
  workflowClient.prefetchList({
    ...queryOptions,
    options: optionsWithCookies(queryOptions.options, cookies),
  });
};
