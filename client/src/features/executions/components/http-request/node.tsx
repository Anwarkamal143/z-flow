'use client'

import { GlobeIcon } from '@/assets/icons'
import { Node, NodeProps } from '@xyflow/react'
import { memo } from 'react'
import BaseExecutionNode from '../base-execution-node'

type IHttpRequestNodeData = {
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: string
  [key: string]: unknown
}
type IHttpRequestNodeType = Node<IHttpRequestNodeData>
const HttpRequestNode = memo((props: NodeProps<IHttpRequestNodeType>) => {
  const nodeData = props.data
  const description = props.data.endpoint
    ? `${nodeData.method || 'GET'}: ${nodeData.endpoint}`
    : 'Not configured'
  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={GlobeIcon}
        description={description}
        id={props.id}
        name='HTTP Request'
        onDoubleClick={() => {}}
        onSettings={() => {}}
      />
    </>
  )
})

HttpRequestNode.displayName = 'HttpRequestNode'
export default HttpRequestNode
