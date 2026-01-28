import { NodeType } from '@/config/enums'
import z from 'zod'
import { dateSchema, ULIDSchema } from './helper'
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

export const SelectNodeSchema = z.object({
  id: ULIDSchema('Provide a valid Node Id'),
  data: z.record(z.string(), z.unknown()),
  name: z.string(),
  type: z
    .enum([
      NodeType.HTTP_REQUEST,
      NodeType.INITIAL,
      NodeType.MANUAL_TRIGGER,
      NodeType.GEMINI,
      NodeType.OPENAI,
      NodeType.ANTHROPIC,
      'unknown',
    ])
    .nullable()
    .optional(),
  position: PositionSchema,
  userId: ULIDSchema(),
  workflowId: ULIDSchema(),
  credentialId: ULIDSchema(),
  deleted_at: dateSchema.nullable().optional(),
  updated_at: dateSchema,
  created_at: dateSchema,
})
export const UpdateNodeSchema = SelectNodeSchema.partial()
