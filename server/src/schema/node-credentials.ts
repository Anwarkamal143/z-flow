import { nodeCredentials } from "@/db/tables";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import { ULIDSchema } from "./helper";
export const UpdateNodeCredentialSchema = createUpdateSchema(nodeCredentials);
export const UpdateUserNodeCredentialSchema = createUpdateSchema(
  nodeCredentials,
).extend({
  id: ULIDSchema("Provide a valid Id"),
  userId: ULIDSchema("Provide a valid UserId"),
});

export const InsertNodeCredentialSchema = createInsertSchema(nodeCredentials);
export const InsertManyNodeCredentialsSchema = z
  .array(InsertNodeCredentialSchema)
  .min(1, { error: "Provide node credential" });
export const SelectNodeCredentialschema = createSelectSchema(nodeCredentials);
export type InsertNodeCredential = InferInsertModel<typeof nodeCredentials>;
export type INodeCredential = InferSelectModel<typeof nodeCredentials>;
export type UpdateNodeCredential = z.infer<typeof UpdateNodeCredentialSchema>;
export type IUpdateUserNodeCredential = z.infer<
  typeof UpdateUserNodeCredentialSchema
>;
