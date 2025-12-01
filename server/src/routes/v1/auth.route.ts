import authController from "@/controllers/auth.controller";
import { FastifyInstance } from "fastify";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/sign-out", authController.signOut);
  fastify.post("/register", authController.signUp);
  fastify.post("/login", authController.login);
  fastify.get("/refresh-tokens", authController.refreshTokens);
}
