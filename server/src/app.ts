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
import errorPlugin from "./plugins/catch-error";
import inngest from "./plugins/inngest";
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
        HTTPSTATUS.UNAUTHORIZED,
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
      ...(!ENVIRONMENTS.isProduction
        ? {
            transport: {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
              },
            },
          }
        : {}),
    },
    trustProxy: true,
  });
  // register plugins
  fastify.register(cors, CORS_OPTIONS);
  fastify.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  fastify.register(errorPlugin);
  fastify.register(cookieParser);
  fastify.register(registerLogger);
  fastify.register(drizzlePlugin);
  fastify.register(redisPlugin);
  fastify.register(socketPlugin);
  fastify.register(inngest);

  // routes
  fastify.register(v1Routes);

  // healthcheck

  // simple ready check
  fastify.get("/ready", async (_request, reply) => {
    try {
      return reply.status(200).send({ ready: true });
    } catch (err) {
      reply.status(503).send({ ready: false });
    }
  });

  return fastify;
}
