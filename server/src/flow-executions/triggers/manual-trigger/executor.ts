import { publishEvent } from "@/app_inngest/channels/manual-trigger";
import { NodeExecutor, NodeExecutorParams } from "@/flow-executions/types";

type ManualTriggerData = Record<string, unknown>;
export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  nodeId,
  context,
  step,
  workflowId,
  publish,
}: NodeExecutorParams<ManualTriggerData>) => {
  const event = {
    nodeId,
    jobId: nodeId,
    step: "initial",
    status: "loading",
    event: "status",
    channel: workflowId,
  };

  const result = await step.run("manual-trigger", async () => {
    await publishEvent({ publish, event });

    await publishEvent({
      publish,
      event: {
        ...event,
        step: "processing",
        status: "success",
      },
    });

    return context;
  });
  return result;
};
