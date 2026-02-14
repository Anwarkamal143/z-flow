'use client'

import { GlobeIcon } from '@/assets/icons'
import { useUpdateNode } from '@/features/nodes/api/mutation-hooks'
import { useFlowContext } from '@/hooks/useFlowContext'
import { INode } from '@/types/Inode'
import { Node, NodeProps, useReactFlow } from '@xyflow/react'
import { memo, useState } from 'react'
import useNodeStatus from '../../hooks/use-realtime-node'
import BaseExecutionNode from '../base-execution-node'
import HttpRequestDialog, { HttpRequestFormValues } from './dialog'

type IHttpRequestNodeData = {
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: string
  variableName?: string
}
type IHttpRequestNodeType = Node<IHttpRequestNodeData>
const HttpRequestNode = memo((props: NodeProps<IHttpRequestNodeType>) => {
  const [open, onOpenChange] = useState(false)
  const { setNodes, getNode } = useReactFlow()
  const { workflowId } = useFlowContext()

  const nodeData = props.data
  const description = props.data.endpoint
    ? `${nodeData.method || 'GET'}: \n ${nodeData.endpoint}`
    : 'Not configured'
  const status = useNodeStatus({
    nodeId: props.id,
    event: 'status',
  })
  const { updateNode, isPending } = useUpdateNode(workflowId)

  const handleOpenSettings = () => onOpenChange(true)
  const handleSubmit = async (values: HttpRequestFormValues) => {
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
      <HttpRequestDialog
        open={open}
        onOpenChange={onOpenChange}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        icon={GlobeIcon}
        description={description}
        id={props.id}
        name='HTTP Request'
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
        status={status}
      />
    </>
  )
})

HttpRequestNode.displayName = 'HttpRequestNode'
export default HttpRequestNode
