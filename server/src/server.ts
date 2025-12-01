import { APP_CONFIG } from "@/config/app.config";
import setUpSentry from "./instrument";

import { buildApp } from "./app";
import { setupShutdownHandlers } from "./utils/shutdown";

const fastify = buildApp();
setUpSentry(fastify);
const port = Number(APP_CONFIG.PORT || 4000);

const start = async () => {
  try {
    await fastify.listen({ port, host: "0.0.0.0" });
    fastify.log.info(`Server listening on ${port}`);
    // handle graceful shutdown
    setupShutdownHandlers(fastify);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
export default fastify;
