import { NodeType } from '@/config/enums'
import z from 'zod'
import { ULIDSchema } from './helper'
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
      'unknown',
    ])
    .nullable()
    .optional(),
  position: PositionSchema,
  userId: ULIDSchema(),
  workflowId: ULIDSchema(),
  deleted_at: z.date().nullable().optional(),
  updated_at: z.date(),
  created_at: z.date(),
})
export const UpdateNodeSchema = SelectNodeSchema.optional()
