import { workflowClient } from "@/models/v1/Workflow.model";

export const workflowListqueryOptions: typeof workflowClient.listOptions = {
  queryKey: ["workflow_list"],
};
