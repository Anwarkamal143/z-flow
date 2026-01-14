import { InitialNode } from '@/components/initial-node'
import { NodeStatus } from '@/components/react-flow/node-status-indicator'
import { NodeType } from '@/config/enums'
import HttpRequestNode from '@/features/executions/components/http-request/node'
import GoogleFormTriggerNode from '@/features/triggers/components/google-form-trigger/node'
import ManualTriggerNode from '@/features/triggers/components/manul-trigger/node'
import { NodeTypes } from '@xyflow/react'

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
} as const satisfies NodeTypes

export type RegisterNodeType = keyof typeof nodeComponents
export const NODE_STATUSES: Record<NodeStatus, NodeStatus> = {
  error: 'error',
  loading: 'loading',
  initial: 'initial',
  success: 'success',
}
