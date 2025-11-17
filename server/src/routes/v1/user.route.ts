import userController from "@/controllers/user.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import { FastifyInstance } from "fastify";

export default async function userRoutes(fastify: FastifyInstance) {
  // Optional: apply middleware to all routes in this module
  fastify.addHook("preHandler", authMiddleware.loggedInUser);

  // GET /user → findAll
  fastify.get("/", userController.findAll);

  // GET /user/me → current user
  fastify.get("/me", userController.me);

  // POST /user/me → findById via POST
  fastify.post("/me", userController.findById);

  // GET /user/:userId → findById
  fastify.get("/:userId", userController.findById);
}
