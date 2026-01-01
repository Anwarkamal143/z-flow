import { NodeType } from "@/db";
import { NodeExecutor } from "@/flow-executions/types";
import { NotFoundException } from "@/utils/catch-errors";
import { httpRequestExecutor } from "./http-request/executor";
import { manualTriggerExecutor } from "./triggers/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];

  if (!executor) {
    throw new NotFoundException(`No executor found for node type: ${type}`);
  }
  return executor;
};
