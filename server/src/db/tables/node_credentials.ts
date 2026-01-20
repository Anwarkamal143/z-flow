import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { baseTimestamps } from "../helpers";
import { credentials } from "./credentials";
import { nodes } from "./node";

export const nodeCredentials = pgTable("node_credentials", {
  nodeId: text("nodeId")
    .notNull()
    .references(() => nodes.id, { onDelete: "cascade" }),

  credentialId: text("credentialId")
    .notNull()
    .references(() => credentials.id, { onDelete: "cascade" }),

  ...baseTimestamps,
});

export const nodeCredentialsRelations = relations(
  nodeCredentials,
  ({ one }) => ({
    node: one(nodes, {
      fields: [nodeCredentials.nodeId],
      references: [nodes.id],
    }),
    credential: one(credentials, {
      fields: [nodeCredentials.credentialId],
      references: [credentials.id],
    }),
  }),
);
