import { redisClient } from "@/config/redis";

// plugins/socket.ts
import RedisSocket from "@/config/socket";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  if (redisClient.isConnected) {
    const redisSocket = RedisSocket.getInstance();

    fastify.decorate("socket", redisSocket);

    fastify.addHook("onReady", async () => {
      const httpServer = fastify.server;

      redisSocket.connect(httpServer);
    });

    fastify.addHook("onClose", async () => {
      await redisSocket.disconnect();
    });
  }
});
