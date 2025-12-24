import { connections } from "@/db/tables";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
export const UpdateEdgeSchema = createUpdateSchema(connections);

export const InsertEdgeSchema = createInsertSchema(connections);
export const SelectEdgeSchema = createSelectSchema(connections);
export type InsertEdge = InferInsertModel<typeof connections>;
export type IEdge = InferSelectModel<typeof connections>;
export type IOutputEdge = Omit<
  InferSelectModel<typeof connections>,
  "fromNodeId" | "toNodeId" | "fromOutput" | "toInput"
> & {
  source: IEdge["fromNodeId"];
  target: IEdge["toNodeId"];
  sourceHandle: IEdge["fromOutput"];
  targetHandle: IEdge["toInput"];
};
export type IInputEdge = IOutputEdge;
export type UpdateEdge = z.infer<typeof UpdateEdgeSchema>;
