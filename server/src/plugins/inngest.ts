import { functions, inngest } from "@/app_inngest";
import fp from "fastify-plugin";
import fastifyPlugin from "inngest/fastify";

export default fp(async (fastify) => {
  // register the official plugin
  await fastify.register(fastifyPlugin, {
    client: inngest,
    functions: functions,
  });

  fastify.decorate("inngest", inngest);
});
