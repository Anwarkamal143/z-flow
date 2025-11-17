import IoRedis from "@/config/redis";
import fp from "fastify-plugin";

import type { FastifyPluginAsync } from "fastify";
import Redis from "ioredis";

const redisPlugin: FastifyPluginAsync = async (fastify) => {
  const client = IoRedis.connect() as Redis;

  client.on("error", (err) => fastify.log.error("Redis error", err as any));
  client.on("connect", () => fastify.log.info("Connected to Redis"));

  fastify.decorate("redis", client);

  fastify.addHook("onClose", async (fastifyInstance) => {
    fastifyInstance.log.info("Disconnecting Redis...");
    await client.quit();
  });
};

export default fp(redisPlugin);
