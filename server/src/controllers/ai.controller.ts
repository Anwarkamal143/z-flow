import { AIService } from "@/services/ai.service";
import { SuccessResponse } from "@/utils/requestResponse";
import { FastifyReply, FastifyRequest } from "fastify";

class AIController {
  private ai: AIService;

  constructor(ai: AIService) {
    this.ai = ai;
  }

  /**
   * Generate a normal (non-stream) AI response
   */
  public async generate(req: FastifyRequest, rep: FastifyReply) {
    try {
      const { prompt } = req.body as { prompt: string };

      if (!prompt) {
        return rep.status(400).send({ error: "Prompt is required" });
      }

      const result = await this.ai.generate(prompt);

      // return rep.status(200).send({
      //   ok: true,
      //   result,
      // });

      return SuccessResponse(rep, {
        data: { ...result },
        status: "success",
        statusCode: 200,
        message: "Job is queued",
      });
    } catch (error) {
      console.error("AI generate error:", error);
      return rep.status(500).send({ error: "Failed to generate response" });
    }
  }

  /**
   * Stream AI text output using Server-Sent Events
   */
  public async stream(req: FastifyRequest, rep: FastifyReply) {
    try {
      const { prompt } = req.query as { prompt?: string };

      if (!prompt) {
        return rep.status(400).send({ error: "Prompt is required" });
      }

      const stream = await this.ai.generateStream(prompt);

      // Prepare SSE
      rep.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      for await (const chunk of stream.textStream) {
        rep.raw.write(`data: ${chunk}\n\n`);
      }

      rep.raw.end();
    } catch (error) {
      console.error("AI stream error:", error);
      return rep.status(500).send({ error: "Failed to stream response" });
    }
  }
}

// Export a singleton instance
export default new AIController(new AIService());
