import webhooksController from "@/controllers/webhooks.controller";
import { FastifyInstance } from "fastify";

export default async function googleFormRoutes(fastify: FastifyInstance) {
  // POST /webhooks/google-form → current user
  fastify.post("/google-form", webhooksController.googleForm);
}
