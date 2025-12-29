import z from 'zod'
import { ULIDSchema } from './helper'

export const SelectEdgeSchema = z.object({
  id: ULIDSchema('Provide a valid Node Id'),
  name: z.string(),
  fromNodeId: ULIDSchema('Provide source node id'),
  toNodeId: ULIDSchema('Provide a target node id'),
  fromOutput: z.string().nullable().optional(),
  toInput: z.string().nullable().optional(),

  userId: ULIDSchema(),
  workflowId: ULIDSchema(),
  deleted_at: z.date().nullable().optional(),
  updated_at: z.date(),
  created_at: z.date(),
})

export const UpdateEdgeSchema = SelectEdgeSchema.optional()
