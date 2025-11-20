import { APP_CONFIG } from "@/config/app.config";
import { buildApp } from "./app";
import { gracefulShutdown } from "./utils/shutdown";

const fastify = buildApp();

const port = Number(APP_CONFIG.PORT || 4000);

const start = async () => {
  try {
    await fastify.listen({ port, host: "0.0.0.0" });
    await fastify.db.select("1");
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
