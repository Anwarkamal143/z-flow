import { publishEvent } from "@/app_inngest/channels/http-request";
import { credentialService } from "@/services/credentails.service";
import { createAnthropic } from "@ai-sdk/anthropic"; // Correct import
import { generateText } from "ai"; // From Vercel AI SDK
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { NodeExecutor, NodeExecutorParams } from "../types";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

type AnthropicExecutor = {
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  variableName: string;
  credentialId?: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicExecutor> = async ({
  data,
  nodeId,
  workflowId,
  context,
  step,
  userId,
  publish,
}: NodeExecutorParams<AnthropicExecutor>) => {
  const baseEvent = {
    nodeId,
    jobId: nodeId,
    event: "status",
    channel: workflowId,
  };

  const {
    userPrompt,
    systemPrompt,
    model: modelName = "claude-3-5-haiku-latest",
    variableName,
    credentialId,
  } = data;

  /* ---------------- Validation ---------------- */
  await step.run(`Anthropic-validate-${nodeId}`, async () => {
    await publishEvent({
      publish,
      event: {
        ...baseEvent,
        step: "validating",
        status: "loading",
      },
    });

    if (!userId?.trim())
      throw new NonRetriableError("Anthropic node: UserId is missing");

    if (!credentialId?.trim())
      throw new NonRetriableError("Anthropic node: Credentials are missing");

    if (!variableName?.trim())
      throw new NonRetriableError("Anthropic node: Variable name is missing");

    if (!userPrompt?.trim())
      throw new NonRetriableError("Anthropic node: User prompt is missing");
  });
  const credential = await step.run(
    `anthropic-get-credentials-${nodeId}`,
    async () => {
      // Fetch and validate credentials here
      // For example, you might fetch from a secure store or database
      // This is a placeholder implementation
      const credsResp = await credentialService.resolveByIdUserId(
        credentialId!,
        userId!,
      );

      if (!credsResp.data?.value) {
        throw new NonRetriableError("Anthropic node: Invalid credentials");
      }

      return credsResp.data?.value;
    },
  );
  if (!credential) {
    throw new NonRetriableError("Anthropic node: Invalid credentials");
  }
  /* ---------------- Template Resolution ---------------- */
  const { resolvedUserPrompt, resolvedSystemPrompt } = await step.run(
    `anthropic-template-${nodeId}`,
    async () => {
      try {
        const resolvedUserPrompt = Handlebars.compile(userPrompt)(context);

        if (!resolvedUserPrompt)
          throw new Error(
            "Anthropic node: userPrompt resolved to empty string",
          );

        const resolvedSystemPrompt = systemPrompt
          ? Handlebars.compile(systemPrompt)(context)
          : "You are a helpful assistant.";

        if (!resolvedSystemPrompt)
          throw new Error(
            "Anthropic node: systemPrompt resolved to empty string",
          );

        return { resolvedUserPrompt, resolvedSystemPrompt };
      } catch {
        await publishEvent({
          publish,
          event: {
            ...baseEvent,
            step: "templating",
            status: "error",
            error: "Anthropic node: Failed to resolve prompt templates",
          },
        });

        throw new NonRetriableError(
          "Anthropic node: Failed to resolve prompt templates",
        );
      }
    },
  );

  /* ---------------- AI Execution ---------------- */
  /* ---------------- AI Execution ---------------- */
  const anthropic = createAnthropic({
    apiKey: credential,
  });
  const { steps } = await step.ai
    .wrap(`Anthropic-generate-${nodeId}`, generateText, {
      model: anthropic(modelName),
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
