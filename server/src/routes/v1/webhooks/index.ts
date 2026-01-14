import { FastifyInstance } from "fastify";
import googleFormRoutes from "./google-form";

export default async function webHooksRoutes(fastify: FastifyInstance) {
  // POST /webhooks/google-form → current user

  fastify.register(googleFormRoutes);

  // healthcheck

  // simple ready check
}
