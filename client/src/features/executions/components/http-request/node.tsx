'use client'

import { GlobeIcon } from '@/assets/icons'
import { Node, NodeProps, useReactFlow } from '@xyflow/react'
import { memo, useState } from 'react'
import BaseExecutionNode from '../base-execution-node'
import HttpRequestDialog, { HttpRequestFormValues } from './dialog'

type IHttpRequestNodeData = {
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: string
  [key: string]: unknown
}
type IHttpRequestNodeType = Node<IHttpRequestNodeData>
const HttpRequestNode = memo((props: NodeProps<IHttpRequestNodeType>) => {
  const [open, onOpenChange] = useState(false)
  const { setNodes } = useReactFlow()
  const nodeData = props.data
  const description = props.data.endpoint
    ? `${nodeData.method || 'GET'}: \n ${nodeData.endpoint}`
    : 'Not configured'
  const nodeStatus = 'initial'

  const handleOpenSettings = () => onOpenChange(true)
  const handleSubmit = (values: HttpRequestFormValues) => {
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
        status={nodeStatus}
      />
    </>
  )
})

HttpRequestNode.displayName = 'HttpRequestNode'
export default HttpRequestNode
