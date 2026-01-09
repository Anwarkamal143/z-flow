import { NodeType } from "@/db";
import { getExecutor } from "@/flow-executions";
import { workflowService } from "@/services/workflow.service";
import { NonRetriableError } from "inngest";
import { inngest } from "../client";

import { WORKFLOW_EVENT_NAMES } from "@/flow-executions/events/workflow";
import { topologicalSort } from "../utils";

export default inngest.createFunction(
  { id: "execute-workflow" },
  { event: WORKFLOW_EVENT_NAMES.WORKFLOW_EXECUTE },
  async ({ event, step }) => {
    const workflowId = event.data.workflowId;
    if (!workflowId) {
      throw new NonRetriableError("Workflow Id is missing");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await workflowService.getByFieldWithNodesAndConnections(
        workflowId,
        (fields) => fields.id
      );
      if (!workflow.data) {
        throw new NonRetriableError("Workflow doesn't exist");
      }
      // console.log(workflow.data.nodes, "workflow nodes");
      return topologicalSort(workflow.data.nodes, workflow.data.edges);
    });

    // Initialize the context with any initial data from trigger

    let context = event.data.initialData || {};
    // Execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
      });
    }

    return { workflowId, context };
  }
);
