import type { FastifyInstance } from "fastify";

export function gracefulShutdown(fastify: FastifyInstance) {
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGQUIT"];
  signals.forEach((sig) =>
    process.on(sig, async () => {
      try {
        fastify.log.info(`Received ${sig} - closing server`);
        await fastify.close();
        process.exit(0);
      } catch (err) {
        fastify.log.error(err);
        process.exit(1);
      }
    })
  );
}
