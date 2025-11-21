// src/services/ai.service.ts
import { EVENT_NAMES } from "@/app_inngest/types";
import fastify from "@/server";
import { google } from "@ai-sdk/google";
import { LanguageModel, streamText } from "ai";

export class AIService {
  public model: LanguageModel;

  constructor() {
    this.model = google("gemini-2.5-flash");
  }

  async generate(prompt: string) {
    const resp = await fastify.inngest.send({
      name: EVENT_NAMES.AI_GENERATE,

      data: {
        prompt: prompt,
      },
    });
    // const { text } = await generateText({
    //   model: this.model,
    //   prompt,
    // });

    return resp;
  }

  async generateStream(prompt: string) {
    return streamText({
      model: this.model,
      prompt,
    });
  }
}

export const aiService = new AIService();
