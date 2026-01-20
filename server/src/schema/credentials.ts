import { credentials } from "@/db/tables";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
export const UpdateCredentialsSchema = createUpdateSchema(credentials);

export const InsertCredentialsSchema = createInsertSchema(credentials);
export const InsertManycredentialssSchema = z
  .array(InsertCredentialsSchema)
  .min(1, { error: "Provide credentials data" });
export const SelectCredentialsschema = createSelectSchema(credentials);
export type InsertCredentials = InferInsertModel<typeof credentials>;
export type ICredentials = InferSelectModel<typeof credentials>;
export type UpdateCredentials = z.infer<typeof UpdateCredentialsSchema>;
