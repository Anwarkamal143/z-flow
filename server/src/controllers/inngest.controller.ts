import { EVENT_NAMES } from "@/app_inngest/types";
import { inngestService } from "@/services/inngest.service";
import { FastifyReply, FastifyRequest } from "fastify";

class InngestController {
  /**
   * Sends a demo event "demo/event.sent"
   */
  public async sendDemo(_req: FastifyRequest, rep: FastifyReply) {
    try {
      await inngestService.send({
        name: EVENT_NAMES.DEMO_SENT,
        data: {
          message: "Hello from server with resolve 2",
        },
      });

      rep.status(200).send({ message: "Event sent!" });
    } catch (error) {
      console.error("Error sending demo event:", error);
      rep.status(500).send({ error: "Failed to send event" });
    }
  }
}

// Export a singleton instance for route registration
export default new InngestController();
