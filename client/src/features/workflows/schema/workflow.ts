import z from 'zod'
import { SelectEdgeSchema } from './edge'
import { ULIDSchema } from './helper'
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
})
export const UpdateWorkflowEdgeSchema = z.object({
  source: SelectEdgeSchema.shape.fromNodeId,
  target: SelectEdgeSchema.shape.toNodeId,
  sourceHandle: SelectEdgeSchema.shape.fromOutput,
  targetHandle: SelectEdgeSchema.shape.toInput,
})

export const UpdateWorkflowWithNodesEdgesSchema = z.object({
  id: ULIDSchema('Invalid Workflow Id'),
  nodes: z.array(
    z.object({
      id: ULIDSchema('Invalid Node Id'),
      type: z.string().nullish(),
      position: PositionSchema,
      data: z.record(z.string(), z.any()).optional(),
      credentialId: ULIDSchema('Invalid Credential Id').nullish(),
    }),
  ),
  edges: z.array(UpdateWorkflowEdgeSchema),
})
export type IUpdateWorkflowWithNodesEdges = z.infer<
  typeof UpdateWorkflowWithNodesEdgesSchema
>
