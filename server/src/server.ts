import "dotenv/config";
import { buildApp } from "./app";
import { gracefulShutdown } from "./utils/shutdown";

const fastify = buildApp();

const port = Number(process.env.PORT || 4000);

const start = async () => {
  try {
    await fastify.listen({ port, host: "0.0.0.0" });
    fastify.log.info(`Server listening on ${port}`);
    // handle graceful shutdown
    gracefulShutdown(fastify);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
export default fastify;
