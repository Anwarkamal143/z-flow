import { workflows } from "@/db/tables";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
export const UpdateWorkflowsSchema = createUpdateSchema(workflows);

export const InsertWorkflowsSchema = createInsertSchema(workflows);
export const SelectWorkflowsSchema = createSelectSchema(workflows);

export type InsertWorkflows = InferInsertModel<typeof workflows>;
export type SelectWorkflows = InferSelectModel<typeof workflows>;
export type UpdateWorkflows = z.infer<typeof UpdateWorkflowsSchema>;
