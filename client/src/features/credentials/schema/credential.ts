import { CredentialType, ICredentialType } from '@/config/enums'
import { ULIDSchema } from '@/features/workflows/schema/helper'
import z from 'zod'

export const CredentialSelectSchema = z.object({
  updated_at: z.date(),
  created_at: z.date(),
  deleted_at: z.date().nullable(),
  id: z.string(),
  name: z.string(),
  value: z.string(),
  userId: z.string().nullable(),
  type: z.enum(CredentialType as unknown as ICredentialType[]),
  metadata: z.record(z.any(), z.unknown()).optional(),
  // secretCiphertext: z.string(),
  // secretIv: z.string(),
  // secretAuthTag: z.string(),
  // dekCiphertext: z.string(),
  // dekIv: z.string(),
  // dekAuthTag: z.string(),
  // dekSalt: z.string(),
  // keyVersion: z.number(),
})

// Type inference for TypeScript

export const CredentialInsertSchema = CredentialSelectSchema.pick({
  type: true,
  name: true,
  userId: true,
}).extend({
  value: z.string(),
  metadata: z.record(z.any(), z.unknown()).optional(),
})
export const CredentialInsertBulkSchema = z
  .array(CredentialInsertSchema)
  .min(1, { error: 'Provide credentials data' })
export const CredentialUpdateSchema = CredentialInsertSchema.extend({
  value: z.string().optional(),
  type: CredentialInsertSchema.shape.type.optional(),
  name: CredentialInsertSchema.shape.name.optional(),
  userId: CredentialInsertSchema.shape.userId.optional(),
  metadata: z.record(z.any(), z.unknown()).optional(),
  id: ULIDSchema('Provide a valid Id'),
})
export type ICredentialInsert = z.infer<typeof CredentialInsertSchema>
export type ICredentialUpdate = z.infer<typeof CredentialUpdateSchema>
export type ICredential = z.infer<typeof CredentialSelectSchema>
