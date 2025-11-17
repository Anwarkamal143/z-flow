// plugins/socket.ts
import RedisSocket from "@/config/socket";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  const redisSocket = RedisSocket.getInstance();

  fastify.decorate("socket", redisSocket);

  fastify.addHook("onReady", async () => {
    const httpServer = fastify.server;

    redisSocket.connect(
      httpServer
      // fastify.redis // fastify-redis plugin client
    );
  });

  fastify.addHook("onClose", async () => {
    await redisSocket.disconnect();
  });
});
