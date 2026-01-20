import { publishEvent } from "@/app_inngest/channels/http-request";
import { APP_CONFIG } from "@/config/app.config";
import { createOpenAI } from "@ai-sdk/openai"; // Correct import
import { generateText } from "ai"; // From Vercel AI SDK
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { NodeExecutor, NodeExecutorParams } from "../types";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

type OpenaiExecutor = {
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  variableName: string;
};

export const openaiExecutor: NodeExecutor<OpenaiExecutor> = async ({
  data,
  nodeId,
  workflowId,
  context,
  step,
  publish,
}: NodeExecutorParams<OpenaiExecutor>) => {
  const baseEvent = {
    nodeId,
    jobId: nodeId,
    event: "status",
    channel: workflowId,
  };

  const {
    userPrompt,
    systemPrompt,
    model: modelName = "o3",
    variableName,
  } = data;

  /* ---------------- Validation ---------------- */
  await step.run(`Openai-validate-${nodeId}`, async () => {
    await publishEvent({
      publish,
      event: {
        ...baseEvent,
        step: "validating",
        status: "loading",
      },
    });

    if (!variableName?.trim())
      throw new NonRetriableError("Openai node: Variable name is missing");

    if (!userPrompt?.trim())
      throw new NonRetriableError("Openai node: User prompt is missing");
  });

  /* ---------------- Template Resolution ---------------- */
  const { resolvedUserPrompt, resolvedSystemPrompt } = await step.run(
    `Openai-template-${nodeId}`,
    async () => {
      try {
        const resolvedUserPrompt = Handlebars.compile(userPrompt)(context);

        if (!resolvedUserPrompt)
          throw new Error("Openai node: userPrompt resolved to empty string");

        const resolvedSystemPrompt = systemPrompt
          ? Handlebars.compile(systemPrompt)(context)
          : "You are a helpful assistant.";

        if (!resolvedSystemPrompt)
          throw new Error("Openai node: systemPrompt resolved to empty string");

        return { resolvedUserPrompt, resolvedSystemPrompt };
      } catch {
        await publishEvent({
          publish,
          event: {
            ...baseEvent,
            step: "templating",
            status: "error",
            error: "Openai node: Failed to resolve prompt templates",
          },
        });

        throw new NonRetriableError(
          "Openai node: Failed to resolve prompt templates",
        );
      }
    },
  );

  /* ---------------- AI Execution ---------------- */
  /* ---------------- AI Execution ---------------- */
  const openai = createOpenAI({
    apiKey: APP_CONFIG.OPENAI_API_KEY,
  });
  const { steps } = await step.ai
    .wrap(`Openai-generate-${nodeId}`, generateText, {
      model: openai(modelName),
      system: resolvedSystemPrompt,
      prompt: resolvedUserPrompt,

      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    })
    .catch(async (e) => {
      await publishEvent({
        publish,
        event: {
          ...baseEvent,
          step: "processing",
          status: "error",
          stepId: e.stepId,
          error: e.message,
        },
      });

      throw e;
    });

  await publishEvent({
    publish,
    event: {
      ...baseEvent,
      step: "processing",
      status: "success",
    },
  });

  const text =
    steps[0]?.content[0]?.type == "text" ? steps[0].content[0].text : "";

  // Store result
  context[variableName] = {
    text,
    model: modelName,
  };

  /* ---------------- Output ---------------- */
  return {
    ...context,
    [variableName]: context[variableName] || { aiResponse: "" },
  };
};
