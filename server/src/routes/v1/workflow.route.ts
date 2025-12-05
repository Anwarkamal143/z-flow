import userController from "@/controllers/user.controller";
import worklowController from "@/controllers/worklow.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import { FastifyInstance } from "fastify";

export default async function workflowRoutes(fastify: FastifyInstance) {
  // Optional: apply middleware to all routes in this module
  fastify.addHook("preHandler", authMiddleware.loggedInUser);

  // GET /user/me → current user
  fastify.get("/", worklowController.create);

  // GET /user → findAll
  fastify.get(
    "/",
    { preHandler: authMiddleware.isAuthenticated },
    userController.findAll
  );

  // GET /user/:userId → findById
  fastify.get<{ Params: { userId: string } }>(
    "/:userId",
    { preHandler: authMiddleware.isAuthenticated },
    userController.findById
  );
}
