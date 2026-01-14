'use client'

import { BaseHandle } from '@/components/react-flow/base-handle'
import { BaseNode, BaseNodeContent } from '@/components/react-flow/base-node'
import {
  NodeStatus,
  NodeStatusIndicator,
} from '@/components/react-flow/node-status-indicator'
import WorkflowNode from '@/components/workflow-node'
import useInitialNode from '@/hooks/useInitialNode'
import { NodeProps, Position, useReactFlow } from '@xyflow/react'
import { LucideIcon } from 'lucide-react'
import { JSX, memo } from 'react'

type IBaseTriggerProps = NodeProps & {
  icon: LucideIcon | string | JSX.ElementType
  name: string
  description?: string
  children?: React.ReactNode
  status?: NodeStatus
  onSettings?: () => void
  onDoubleClick?: () => void
}

const BaseTriggerNode = memo(
  ({
    id,
    icon: Icon,
    name,
    description,
    children,
    onSettings,
    onDoubleClick,
    status = 'initial',
    // ...rest
  }: IBaseTriggerProps) => {
    const { setNodes, setEdges, screenToFlowPosition } = useReactFlow()
    const { getInitialNode } = useInitialNode()
    const handleDelete = () => {
      setNodes((currentNodes) => {
        const updatedNodes = currentNodes.filter((node) => node.id != id)
        if (!updatedNodes.length) {
          return [getInitialNode()]
        }
        return updatedNodes
      })
      setEdges((currentEdges) => {
        const updatedEdges = currentEdges.filter(
          (edge) => edge.source != id && edge.target != id,
        )
        return updatedEdges
      })
    }
    return (
      <WorkflowNode
        name={name}
        description={description}
        onSettings={onSettings}
        showToolbar
        onDelete={handleDelete}
        // {...rest}
      >
        <NodeStatusIndicator
          status={status}
          variant='border'
          className='rounded-md rounded-l-2xl'
        >
          <BaseNode
            status={status}
            onDoubleClick={onDoubleClick}
            className='group relative rounded-l-2xl'
          >
            <BaseNodeContent>
              {typeof Icon === 'string' ? (
                <img src={Icon} alt={name} className='h-[16px] w-[16px]' />
              ) : (
                <Icon className='h-[16px] w-[16px]' />
              )}
              {children}

              <BaseHandle
                id={'source-1'}
                type='source'
                position={Position.Right}
              />
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    )
  },
)
BaseTriggerNode.displayName = 'BaseTriggerNode'
export default BaseTriggerNode
