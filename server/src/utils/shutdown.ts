import type { FastifyInstance } from "fastify";

export function gracefulShutdown(fastify: FastifyInstance) {
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGQUIT"];

  for (const signal of signals) {
    process.on(signal, async () => {
      fastify.log.info(`🛑 Received ${signal} - shutting down gracefully...`);

      try {
        await fastify.close(); // closes routes, plugins, http server

        fastify.log.info("✅ Fastify closed. Exiting now.");
        process.exit(0);
      } catch (err: any) {
        fastify.log.error("❌ Error during shutdown:", err);
        process.exit(1);
      }
    });
  }
}
