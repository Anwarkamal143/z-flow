import { publishEvent } from "@/app_inngest/channels/manual-trigger";
import { NodeExecutor, NodeExecutorParams } from "@/flow-executions/types";
type StripeTriggerData = Record<string, unknown>;
export const StripeTriggerExecutor: NodeExecutor<StripeTriggerData> = async ({
  nodeId,
  context,
  step,
  workflowId,
  publish,
  data,
}: NodeExecutorParams<StripeTriggerData>) => {
  const event = {
    nodeId,
    jobId: nodeId,
    step: "initial",
    status: "loading",
    event: "status",
    channel: workflowId,
  };
  const result = await step.run("stripe-trigger", async () => {
    await publishEvent({ publish, event });

    await publishEvent({
      publish,
      event: {
        ...event,
        step: "processing",
        status: "success",
        data,
      },
    });

    return context;
  });
  return result;
};
