import { credentialservice } from "@/services/credentails.service";
import { FastifyReply, FastifyRequest } from "fastify";

class InngestController {
  /**
   * Sends a demo event "demo/event.sent"
   */
  public async testPoint(_req: FastifyRequest, rep: FastifyReply) {
    try {
      const body = _req.body as Record<string, any>;
      const data = await credentialservice.createCredentail({
        userId: body.userId,
        secret: body.secret,
        type: "anthropic",
      });
      console.log(data, "response");
      rep.status(200).send(data.data);
    } catch (error) {
      console.error("Error sending demo event:", error);
      rep.status(500).send({ error: "Failed to send event" });
    }
  }
  public async testPoint2(_req: FastifyRequest, rep: FastifyReply) {
    try {
      const query = _req.query as Record<string, any>;
      const data = await credentialservice.resolveById(query.id);
      console.log(data, "response");
      rep.status(200).send(data.data);
    } catch (error) {
      console.error("Error sending demo event:", error);
      rep.status(500).send({ error: "Failed to send event" });
    }
  }
}

// Export a singleton instance for route registration
export default new InngestController();
