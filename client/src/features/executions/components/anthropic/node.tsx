'use client'

import { AnthropicIcon } from '@/assets/icons'
import { Node, NodeProps, useReactFlow } from '@xyflow/react'
import { memo, useState } from 'react'
import useNodeStatus from '../../hooks/use-realtime-node'
import BaseExecutionNode from '../base-execution-node'
import AnthropicDialog, { AnthropicFormValues } from './dialog'
import { ANTHROPIC_MESSAGES_MODELS, AnthropicMessagesModelId } from './utils'

type IAnthorpicNodeData = {
  model?: AnthropicMessagesModelId
  systemPrompt?: string
  userPrompt?: string
  variableName?: string
}
type IAnthorpicNodeType = Node<IAnthorpicNodeData>
const AnthropcNode = memo((props: NodeProps<IAnthorpicNodeType>) => {
  const [open, onOpenChange] = useState(false)
  const { setNodes } = useReactFlow()

  const nodeData = {
    ...props.data,
    model: props.data?.model || ANTHROPIC_MESSAGES_MODELS[0],
  }

  const description = nodeData.model
    ? `${nodeData.model}: ${nodeData.userPrompt?.slice(0, 50)}...`
    : 'Not configured'
  const status = useNodeStatus({
    nodeId: props.id,
    event: 'status',
  })

  const handleOpenSettings = () => onOpenChange(true)
  const handleSubmit = (values: AnthropicFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id == props.id) {
          return { ...node, data: { ...node.data, ...values } }
        }
        return node
      }),
    )
  }
  return (
    <>
      <AnthropicDialog
        open={open}
        onOpenChange={onOpenChange}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        icon={AnthropicIcon}
        description={description}
        id={props.id}
        name='Anthropic'
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
        status={status}
      />
    </>
  )
})

AnthropcNode.displayName = 'AnthropcNode'
export default AnthropcNode
