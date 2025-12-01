import customerController from "@/controllers/payments/customer.controller";
import { FastifyInstance } from "fastify";

export default async function customerRoutes(app: FastifyInstance) {
  // Subscription-specific routes can be added here

  // Example: GET /subscriptions → list user subscriptions
  app.get("/state", customerController.getPolarCustomer);
}
