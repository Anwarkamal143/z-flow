import { NodeType } from "@/db";
import { getExecutor } from "@/flow-executions";
import { workflowService } from "@/services/workflow.service";
import { NonRetriableError } from "inngest";
import { inngest } from "../client";

import redisClient from "@/config/redis";
import { WORKFLOW_EVENT_NAMES } from "@/flow-executions/events/workflow";
import { topologicalSort } from "../utils";

export default inngest.createFunction(
  { id: "execute-workflow", retries: 0 },
  {
    event: WORKFLOW_EVENT_NAMES.WORKFLOW_EXECUTE,
  },
  async ({ event, step }) => {
    const workflowId = event.data.workflowId;
    if (!workflowId) {
      throw new NonRetriableError("Workflow Id is missing");
    }

    const { sortedNodes, workflow } = await step.run(
      "prepare-workflow",
      async () => {
        const workflow =
          await workflowService.getByFieldWithNodesAndConnections(
            workflowId,
            (fields) => fields.id,
          );
        if (!workflow.data) {
          throw new NonRetriableError("Workflow doesn't exist");
        }
        if (!workflow.data?.userId) {
          throw new NonRetriableError("User not found for workflow");
        }
        console.log(workflow, "workflow");
        // console.log(workflow.data.nodes, "workflow nodes");
        return {
          sortedNodes: topologicalSort(
            workflow.data.nodes,
            workflow.data.edges,
          ),
          workflow: workflow.data,
        };
      },
    );
    // const userId = await step.run("find-user-id", async () => {
    //   const workflow = await workflowService.getByFieldWithNodesAndConnections(
    //     workflowId,
    //     (fields) => fields.id,
    //   );
    //   if (!workflow.data) {
    //     throw new NonRetriableError("Workflow doesn't exist");
    //   }
    //   // console.log(workflow.data.nodes, "workflow nodes");
    //   return topologicalSort(workflow.data.nodes, workflow.data.edges);
    // });

    // Initialize the context with any initial data from trigger

    let context = event.data.initialData || {};
    // Execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        credentialId: node.credentialId,
        context,
        step,
        workflowId,
        userId: workflow.userId,

        publish: redisClient.publish,
      });
    }

    return { workflowId, context };
  },
);
