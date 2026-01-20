'use client'

import { OpenAiIcon } from '@/assets/icons'
import { Node, NodeProps, useReactFlow } from '@xyflow/react'
import { memo, useState } from 'react'
import useNodeStatus from '../../hooks/use-realtime-node'
import BaseExecutionNode from '../base-execution-node'
import OpenAiDialog, { OpenAiFormValues } from './dialog'
import { OPENAI_CHAT_MODELS, OpenAIChatModelId } from './utils'

type IOpenAiNodeData = {
  model?: OpenAIChatModelId
  systemPrompt?: string
  userPrompt?: string
  variableName?: string
}
type IOpenAiNodeType = Node<IOpenAiNodeData>
const OpenAiNode = memo((props: NodeProps<IOpenAiNodeType>) => {
  const [open, onOpenChange] = useState(false)
  const { setNodes } = useReactFlow()

  const nodeData = {
    ...props.data,
    model: props.data?.model || OPENAI_CHAT_MODELS[25],
  }

  const description = nodeData.model
    ? `${nodeData.model}: ${nodeData.userPrompt?.slice(0, 50)}...`
    : 'Not configured'
  const status = useNodeStatus({
    nodeId: props.id,
    event: 'status',
  })

  const handleOpenSettings = () => onOpenChange(true)
  const handleSubmit = (values: OpenAiFormValues) => {
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
      <OpenAiDialog
        open={open}
        onOpenChange={onOpenChange}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        icon={OpenAiIcon}
        description={description}
        id={props.id}
        name='OpenAi'
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
        status={status}
      />
    </>
  )
})

OpenAiNode.displayName = 'OpenAiNode'
export default OpenAiNode
