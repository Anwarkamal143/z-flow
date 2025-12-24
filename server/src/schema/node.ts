import { nodes } from "@/db/tables";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
export const UpdateNodeSchema = createUpdateSchema(nodes);

export const InsertNodeSchema = createInsertSchema(nodes);
export const SelectNodeschema = createSelectSchema(nodes);
export type InsertNode = InferInsertModel<typeof nodes>;
export type INode = InferSelectModel<typeof nodes>;
export type UpdateNode = z.infer<typeof UpdateNodeSchema>;
