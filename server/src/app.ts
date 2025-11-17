import { APP_CONFIG, ENVIRONMENTS } from "@/config/app.config";
import cookieParser from "@fastify/cookie";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import drizzlePlugin from "./plugins/drizzle-plugin";
import socketPlugin from "./plugins/socket";

import { HTTPSTATUS } from "./config/http.config";
import { logger } from "./config/logger";
import { ErrorCode } from "./enums/error-code.enum";
import registerLogger from "./plugins/logger";
import redisPlugin from "./plugins/redis";
import v1Routes from "./routes";
import AppError from "./utils/app-error";
const CORS_OPTIONS = {
  origin: (origin, callback) => {
    if (
      !ENVIRONMENTS.isProduction ||
      !origin ||
      APP_CONFIG.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      const err = new AppError(
        `CORS error ${origin} is not allowed by CORS`,
        HTTPSTATUS.FORBIDDEN,
        { errorCode: ErrorCode.CORS_ERROR } as any
      );
      logger.warn(`CORS error ${origin} is not allowed by CORS`);
      callback(err, false);
    }
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
};
export function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
    },
    trustProxy: true,
  });

  // register plugins
  fastify.register(cors, CORS_OPTIONS);
  fastify.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  fastify.register(cookieParser);
  fastify.register(registerLogger);
  fastify.register(drizzlePlugin);
  fastify.register(redisPlugin);
  fastify.register(socketPlugin);

  // routes
  fastify.register(v1Routes);

  // healthcheck

  fastify.get("/redis-test", async function () {
    await fastify.redis.del("foo");
    await fastify.redis.set("foo", "bar");
    return await fastify.redis.get("foo");
  });

  // simple ready check - ensure DB connection by running a trivial query
  fastify.get("/ready", async (_request, reply) => {
    try {
      await fastify.db.select("1");
      return reply.status(200).send({ ready: true });
    } catch (err) {
      reply.status(503).send({ ready: false });
    }
  });

  return fastify;
}
