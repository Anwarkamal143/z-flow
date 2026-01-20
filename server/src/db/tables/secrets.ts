import { baseTimestamps } from "@/db/helpers";
import { generateUlid } from "@/utils";
import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { nodes, users, workflows } from ".";

export const secrets = pgTable("secrets", {
  id: text("id").primaryKey().$defaultFn(generateUlid),

  workflowId: text("workflowId").references(() => workflows.id, {
    onDelete: "cascade",
  }),

  nodeId: text("nodeId").references(() => nodes.id, { onDelete: "cascade" }), // optional scope

  userId: text("userId").references(() => users.id, { onDelete: "cascade" }),

  /**
   * Optional metadata (provider, label, masked value, etc.)
   * ❌ NEVER store secrets here
   */
  metadata: jsonb("metadata").default({}),

  /* ---------- Encrypted User Secret (with DEK) ---------- */

  secretCiphertext: text("secret_ciphertext").notNull(),
  secretIv: text("secret_iv").notNull(),
  secretAuthTag: text("secret_auth_tag").notNull(),

  /* ---------- Encrypted DEK (with KEK) ---------- */

  dekCiphertext: text("dek_ciphertext").notNull(),
  dekIv: text("dek_iv").notNull(),
  dekAuthTag: text("dek_auth_tag").notNull(),
  dekSalt: text("dek_salt").notNull(),

  /**
   * Allows future master-key rotation
   */
  keyVersion: integer("key_version").notNull().default(1),

  ...baseTimestamps,
});

export const secretsRelations = relations(secrets, ({ one }) => ({
  user: one(users, {
    fields: [secrets.userId],
    references: [users.id],
  }),
  workflow: one(workflows, {
    fields: [secrets.workflowId],
    references: [workflows.id],
  }),
  node: one(nodes, {
    fields: [secrets.nodeId],
    references: [nodes.id],
  }),
}));
