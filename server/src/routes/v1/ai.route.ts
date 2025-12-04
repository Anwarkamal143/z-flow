import AIController from "@/controllers/ai.controller";
import polarMiddleware from "@/middlewares/polar.middleware";
import { FastifyInstance } from "fastify";

export default async function aiRoutes(app: FastifyInstance) {
  app.post(
    "/generate",
    { preHandler: polarMiddleware.premiumSubscription },
    AIController.generate
  );

  app.get(
    "/stream",
    { preHandler: polarMiddleware.premiumSubscription },
    AIController.stream
  );
}
