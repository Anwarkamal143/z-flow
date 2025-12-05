import { generateUlid } from "@/utils";
import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { baseTimestamps } from "../helpers";
import { users } from "./user";

export const workflows = pgTable("workflows", {
  id: text("id").primaryKey().$defaultFn(generateUlid), // Unique asset ID
  name: text("name").notNull(), // Original file name
  userId: text("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  ...baseTimestamps,
});

export const workflowsRelations = relations(workflows, ({ one }) => ({
  user: one(users, {
    fields: [workflows.userId],
    references: [users.id],
  }),
}));
