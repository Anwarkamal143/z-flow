import AIController from "@/controllers/ai.controller";
import { FastifyInstance } from "fastify";

export default async function aiRoutes(app: FastifyInstance) {
  app.post("/generate", (req, rep) => AIController.generate(req, rep));

  app.get("/stream", (req, rep) => AIController.stream(req, rep));
}
