import { InitialNode } from '@/components/initial-node'
import { NodeType } from '@/config/enums'
import { NodeTypes } from '@xyflow/react'

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
} as const satisfies NodeTypes

export type RegisterNodeType = keyof typeof nodeComponents
