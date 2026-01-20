'use client'

import { GeminiIcon } from '@/assets/icons'
import { Node, NodeProps, useReactFlow } from '@xyflow/react'
import { memo, useState } from 'react'
import useNodeStatus from '../../hooks/use-realtime-node'
import BaseExecutionNode from '../base-execution-node'
import GeminiDialog, { GeminiFormValues } from './dialog'
import { GOOGLE_GENERATIVE_AI_MODELS, GoogleGenerativeAIModelId } from './utils'

type IGeminiNodeData = {
  model?: GoogleGenerativeAIModelId
  systemPrompt?: string
  userPrompt?: string
  variableName?: string
}
type IGeminiNodeType = Node<IGeminiNodeData>
const GeminiNode = memo((props: NodeProps<IGeminiNodeType>) => {
  const [open, onOpenChange] = useState(false)
  const { setNodes } = useReactFlow()

  const nodeData = {
    ...props.data,
    model: props.data?.model || GOOGLE_GENERATIVE_AI_MODELS[18],
  }

  const description = nodeData.model
    ? `${nodeData.model}: ${nodeData.userPrompt?.slice(0, 50)}...`
    : 'Not configured'
  const status = useNodeStatus({
    nodeId: props.id,
    event: 'status',
  })

  const handleOpenSettings = () => onOpenChange(true)
  const handleSubmit = (values: GeminiFormValues) => {
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
      <GeminiDialog
        open={open}
        onOpenChange={onOpenChange}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        icon={GeminiIcon}
        description={description}
        id={props.id}
        name='Gemini'
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
        status={status}
      />
    </>
  )
})

GeminiNode.displayName = 'GeminiNode'
export default GeminiNode
