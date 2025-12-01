import { APP_CONFIG } from "@/config/app.config";
import AppError from "@/utils/app-error";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
// import assetsRoutes from "./asset.routes";
// import socialRoutes from "./social.routes";
// import stripeRoutes from "./stripe.routes";
// import uploaderRoutes from "./uploader.routes";
// import userRoutes from "./user.routes";
import aiRoutes from "./v1/ai.route";
import authRoutes from "./v1/auth.route";
import inngestRoutes from "./v1/inngest.route";
import paymentRoutes from "./v1/payments";
import socialRoutes from "./v1/social.route";
import userRoutes from "./v1/user.route";

async function v1RoutesV1(fastify: FastifyInstance) {
  // Health check
  fastify.get("/health", async () => ({
    status: "ok",
    uptime: process.uptime(),
  }));
  // Mount versioned API routes under base path
  fastify.register(
    async (instance) => {
      instance.register(authRoutes, { prefix: "/auth" });
      instance.register(userRoutes, { prefix: "/user" });
      instance.register(socialRoutes, { prefix: "/google" });
      instance.register(inngestRoutes, { prefix: "/inngest" });
      instance.register(aiRoutes, { prefix: "/ai" });
      instance.register(paymentRoutes, { prefix: "/payments" });
      //   instance.register(uploaderRoutes, { prefix: "/media" });
      //   instance.register(stripeRoutes, { prefix: "/stripe" });
      //   instance.register(assetsRoutes, { prefix: "/assets" });
    },
    { prefix: APP_CONFIG.BASE_API_PATH }
  );

  // Optional: Mount Google callback routes outside base path
  fastify.register(socialRoutes, { prefix: "/api/google" });

  // Catch-all for undefined routes
  fastify.setNotFoundHandler((_req: FastifyRequest, _rep: FastifyReply) => {
    throw new AppError(`Can't find ${_req.url} on this server!`, 404);
  });
}

export default async function v1Routes(fastify: FastifyInstance) {
  await v1RoutesV1(fastify);
}
