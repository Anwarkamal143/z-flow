import { publishEvent } from "@/app_inngest/channels/manual-trigger";
import { NodeExecutor, NodeExecutorParams } from "@/flow-executions/types";
type GoogleFormTriggerData = Record<string, unknown>;
export const googleFormTriggerExecutor: NodeExecutor<
  GoogleFormTriggerData
> = async ({
  nodeId,
  context,
  step,
  workflowId,
  publish,
}: NodeExecutorParams<GoogleFormTriggerData>) => {
  const event = {
    nodeId,
    jobId: nodeId,
    step: "initial",
    status: "loading",
    event: "status",
    channel: workflowId,
  };

  const result = await step.run("google-form-trigger", async () => {
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
