import { generateUlid } from "@/utils";
import { relations } from "drizzle-orm";
import { jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { INodeType, NodeType } from "../enumTypes";
import { baseTimestamps, nodeTypeEnum } from "../helpers";
import { connections } from "../schema";
import { users } from "./user";
import { workflows } from "./workflow";

export const nodes = pgTable("nodes", {
  id: text("id").primaryKey().$defaultFn(generateUlid), // Unique asset ID
  name: text("name").notNull(), // Original file name
  userId: text("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  workflowId: text("workflowId")
    .references(() => workflows.id, { onDelete: "cascade" })
    .notNull(),
  type: nodeTypeEnum().default(NodeType.INITIAL).$type<INodeType>(), // Node type
  position: jsonb("position").notNull(), // Node position
  data: jsonb("data").default("{}"), // Node data
  ...baseTimestamps,
});

export const nodeRelations = relations(nodes, ({ one, many }) => ({
  user: one(users, {
    fields: [nodes.userId],
    references: [users.id],
  }),
  workflow: one(workflows, {
    fields: [nodes.workflowId],
    references: [workflows.id],
  }),
  connections: many(connections, { relationName: "node_connections" }),
}));
