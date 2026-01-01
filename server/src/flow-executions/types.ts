import { GetStepTools, Inngest } from "inngest";
import { UUID } from "ulid";

// Workflow execute
export type WorkflowContext = Record<string, unknown>;
export type StepTools = GetStepTools<Inngest.Any>;

export type NodeExecutorParams<TData = Record<string, unknown>> = {
  data: TData;
  nodeId: UUID;
  context: WorkflowContext;
  step: StepTools;
  // publish: TODO add realtime later
};

export type NodeExecutor<TData = Record<string, unknown>> = (
  params: NodeExecutorParams<TData>
) => Promise<WorkflowContext>;
