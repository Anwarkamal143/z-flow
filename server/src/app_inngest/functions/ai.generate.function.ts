import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { inngest } from "../client";
import { EVENT_NAMES } from "../types";
const google = createGoogleGenerativeAI();
// const antropic = createAnthropic();
// const openAi = createOpenAI();

export default inngest.createFunction(
  {
    id: EVENT_NAMES.AI_GENERATE,
    retries: 1,
  },
  { event: EVENT_NAMES.AI_GENERATE },
  async ({ step, event }) => {
    const { steps: geminiaiSteps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        model: google("gemini-2.5-flash"),
        system: "You are a helpful assistant.",
        prompt: event.data.prompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      }
    );
    // const { steps: openaiSteps } = await step.ai.wrap(
    //   "openai-generate-text",
    //   generateText,
    //   {
    //     model: openAi("gpt-3.5-turbo-1106"),
    //     system: "You are a helpful assistant.",
    //     prompt: event.data.prompt,
    //   }
    // );
    // const { steps: antropicSteps } = await step.ai.wrap(
    //   "antropic-generate-text",
    //   generateText,
    //   {
    //     model: antropic("claude-sonnet-4-0"),
    //     system: "You are a helpful assistant.",
    //     prompt: event.data.prompt,
    //   }
    // );

    // return { geminiaiSteps, openaiSteps, antropicSteps };
    return { geminiaiSteps };
  }
);
