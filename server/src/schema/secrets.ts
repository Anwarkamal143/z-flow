import { secrets } from "@/db/tables";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
export const UpdateSecretsSchema = createUpdateSchema(secrets);

export const InsertSecretsSchema = createInsertSchema(secrets);
export const InsertManySecretssSchema = z
  .array(InsertSecretsSchema)
  .min(1, { error: "Provide Secrets data" });
export const SelectSecretsschema = createSelectSchema(secrets);
export type InsertSecrets = InferInsertModel<typeof secrets>;
export type ISecrets = InferSelectModel<typeof secrets>;
export type UpdateSecrets = z.infer<typeof UpdateSecretsSchema>;
