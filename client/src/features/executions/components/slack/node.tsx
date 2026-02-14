'use client'

import { SlackIcon } from '@/assets/icons'
import { useUpdateNode } from '@/features/nodes/api/mutation-hooks'
import { useFlowContext } from '@/hooks/useFlowContext'
import { INode } from '@/types/Inode'
import { Node, NodeProps, useReactFlow } from '@xyflow/react'
import { memo, useState } from 'react'
import useNodeStatus from '../../hooks/use-realtime-node'
import BaseExecutionNode from '../base-execution-node'
import SlackDialog, { SlackFormValues } from './dialog'

type ISlackNodeData = {
  webhookUrl?: string
  content?: string
}
type ISlackNodeType = Node<ISlackNodeData>
const SlackNode = memo((props: NodeProps<ISlackNodeType>) => {
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
  const handleSubmit = async (values: SlackFormValues) => {
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
      <SlackDialog
        open={open}
        onOpenChange={onOpenChange}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        icon={SlackIcon}
        description={description}
        id={props.id}
        name='Slack'
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
        status={status}
      />
    </>
  )
})

SlackNode.displayName = 'SlackNode'
export default SlackNode
