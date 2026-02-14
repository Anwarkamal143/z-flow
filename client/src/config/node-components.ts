import { InitialNode } from '@/components/initial-node'
import { NodeStatus } from '@/components/react-flow/node-status-indicator'
import { NodeType } from '@/config/enums'
import AnthropcNode from '@/features/executions/components/anthropic/node'
import DiscordNode from '@/features/executions/components/discord/node'
import GeminiNode from '@/features/executions/components/gemini/node'
import HttpRequestNode from '@/features/executions/components/http-request/node'
import OpenAiNode from '@/features/executions/components/openai/node'
import SlackNode from '@/features/executions/components/slack/node'
import GoogleFormTriggerNode from '@/features/triggers/components/google-form-trigger/node'
import ManualTriggerNode from '@/features/triggers/components/manul-trigger/node'
import StripeTriggerNode from '@/features/triggers/components/stripe-trigger/node'
import { NodeTypes } from '@xyflow/react'

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenAiNode,
  [NodeType.ANTHROPIC]: AnthropcNode,
  [NodeType.DISCORD]: DiscordNode,
  [NodeType.SLACK]: SlackNode,
} as const satisfies NodeTypes

export type RegisterNodeType = keyof typeof nodeComponents
export const NODE_STATUSES: Record<NodeStatus, NodeStatus> = {
  error: 'error',
  loading: 'loading',
  initial: 'initial',
  success: 'success',
}
