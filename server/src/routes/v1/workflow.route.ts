import userController from "@/controllers/user.controller";
import worklowController from "@/controllers/worklow.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import { IPaginatedParams } from "@/services/base.service";
import { FastifyInstance } from "fastify";

export default async function workflowRoutes(fastify: FastifyInstance) {
  // Optional: apply middleware to all routes in this module
  fastify.addHook("preHandler", authMiddleware.isAuthenticated);

  // POST / → create workflow
  fastify.post("/", worklowController.create);
  // GET / → findAll
  fastify.get("/", userController.findAll);

  fastify.get<{ Querystring: IPaginatedParams }>("/", worklowController.get);

  fastify.get("/:id", worklowController.getById);

  fastify.delete("/:id", worklowController.deleteById);
}
