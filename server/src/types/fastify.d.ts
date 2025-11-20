// src/types/fastify.d.ts

import { inngest } from "@/app_inngest";
import RedisSocket from "@/config/socket"; // your current implementation
import * as schema from "@/db/schema";
import "fastify";
import { FastifyRequest as FType } from "fastify";
import { Redis } from "ioredis";

declare module "fastify" {
  export interface FastifyInstance {
    redis: Redis;
    db: import("drizzle-orm/postgres-js").Drizzle<typeof schema>;
    logger: import("pino").Logger;
    redis_socket: typeof RedisSocket;
    inngest: typeof inngest;
  }

  export interface FastifyRequest extends FType {
    user?: IServerCookieType;
    tokenData?: any;
  }
}
