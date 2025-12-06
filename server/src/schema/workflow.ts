import { workflows } from "@/db/tables";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import { ULIDSchema } from "./helper";
export const UpdateWorkflowsSchema = createUpdateSchema(workflows);

export const InsertWorkflowsSchema = createInsertSchema(workflows);
export const SelectWorkflowsSchema = createSelectSchema(workflows);

export type InsertWorkflows = InferInsertModel<typeof workflows>;
export type SelectWorkflows = InferSelectModel<typeof workflows>;
export type UpdateWorkflows = z.infer<typeof UpdateWorkflowsSchema>;

export const UpdateWorkFlowNameSchema = createUpdateSchema(workflows, {
  userId: ULIDSchema("Invalid User Id"),
  name: z
    .string()
    .min(1, {
      error: "Name is required.",
    })
    .min(3, {
      error: "name must be 3 characters long.",
    }),
  id: ULIDSchema("Invalid Workflow Id"),
});
export const WorkflowByIdUserIdSchema = createUpdateSchema(workflows, {
  userId: ULIDSchema("Invalid User Id"),
  id: ULIDSchema("Invalid Workflow Id"),
});
