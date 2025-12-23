import { generateUlid } from "@/utils";
import { relations } from "drizzle-orm";
import { pgTable, text, unique } from "drizzle-orm/pg-core";
import { baseTimestamps } from "../helpers";
import { nodes } from "./node";
import { users } from "./user";
import { workflows } from "./workflow";

export const connections = pgTable(
  "connections",
  {
    id: text("id").primaryKey().$defaultFn(generateUlid), // Unique asset ID
    name: text("name").notNull(), // Original file name
    userId: text("userId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    workflowId: text("workflowId")
      .references(() => workflows.id, { onDelete: "cascade" })
      .notNull(),
    fromNodeId: text("fromNodeId")
      .references(() => nodes.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
    toNodeId: text("toNodeId")
      .references(() => nodes.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
    fromOutput: text("fromOutput").unique().default("main"), // Output port name
    toInput: text("toInput").unique().default("main"), // Input port name
    ...baseTimestamps,
  },
  (table) => [
    // You can add indexes here if needed
    unique("connections_unique_from_to_idx").on(
      table.fromNodeId,
      table.toNodeId
    ),
    unique("connections_unique_fromOutput_toInput_idx").on(
      table.fromOutput,
      table.toInput
    ),
  ]
);

export const connectionRelations = relations(connections, ({ one }) => ({
  user: one(users, {
    fields: [connections.userId],
    references: [users.id],
  }),
  workflow: one(workflows, {
    fields: [connections.workflowId],
    references: [workflows.id],
  }),
  fromNode: one(nodes, {
    fields: [connections.fromNodeId],
    references: [nodes.id],
  }),
  toNode: one(nodes, {
    fields: [connections.toNodeId],
    references: [nodes.id],
  }),
}));
