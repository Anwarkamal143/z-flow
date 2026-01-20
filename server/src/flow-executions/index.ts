import { NodeType } from "@/db";
import { NodeExecutor } from "@/flow-executions/types";
import { NotFoundException } from "@/utils/catch-errors";
import { anthropicExecutor } from "./anthropic/executor";
import { geminiExecutor } from "./gemini/executor";
import { httpRequestExecutor } from "./http-request/executor";
import { openaiExecutor } from "./openai/executor";
import { googleFormTriggerExecutor } from "./triggers/google-form-trigger/executor";
import { manualTriggerExecutor } from "./triggers/manual-trigger/executor";
import { stripeTriggerExecutor } from "./triggers/stripe-trigger/executor";

export const executorRegistry = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.OPENAI]: openaiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
} as Record<NodeType, NodeExecutor>;

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];

  if (!executor) {
    throw new NotFoundException(`No executor found for node type: ${type}`);
  }
  return executor;
};
