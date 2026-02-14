'use client'

import { DiscordIcon } from '@/assets/icons'
import { useUpdateNode } from '@/features/nodes/api/mutation-hooks'
import { useFlowContext } from '@/hooks/useFlowContext'
import { INode } from '@/types/Inode'
import { Node, NodeProps, useReactFlow } from '@xyflow/react'
import { memo, useState } from 'react'
import useNodeStatus from '../../hooks/use-realtime-node'
import BaseExecutionNode from '../base-execution-node'
import DiscordDialog, { DiscordFormValues } from './dialog'

type IDiscordNodeData = {
  webhookUrl?: string
  content?: string
  username?: string
}
type IDiscordNodeType = Node<IDiscordNodeData>
const DiscordNode = memo((props: NodeProps<IDiscordNodeType>) => {
  const [open, onOpenChange] = useState(false)
  const { setNodes, getNode } = useReactFlow()
  const { workflowId } = useFlowContext()
  const { updateNode, isPending } = useUpdateNode(workflowId)

  const nodeData = props.data

  const description = nodeData?.content
    ? `Send: ${nodeData.content?.slice(0, 50)}...`
    : 'Not configured'
  const status = useNodeStatus({
    nodeId: props.id,
    event: 'status',
  })

  const handleOpenSettings = () => onOpenChange(true)
  const handleSubmit = async (values: DiscordFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id == props.id) {
          return { ...node, data: { ...node.data, ...values } }
        }
        return node
      }),
    )
    const node = getNode(props.id) as INode
    await updateNode({
      ...(node || {}),
      id: props.id,
      data: {
        ...nodeData,
        ...values,
      },
    })
  }
  return (
    <>
      <DiscordDialog
        open={open}
        onOpenChange={onOpenChange}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        icon={DiscordIcon}
        description={description}
        id={props.id}
        name='Discord'
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
        status={status}
      />
    </>
  )
})

DiscordNode.displayName = 'DiscordNode'
export default DiscordNode
