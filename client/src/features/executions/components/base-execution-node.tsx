'use client'

import { BaseHandle } from '@/components/react-flow/base-handle'
import { BaseNode, BaseNodeContent } from '@/components/react-flow/base-node'
import WorkflowNode from '@/components/workflow-node'
import { NodeProps, Position } from '@xyflow/react'
import { LucideIcon } from 'lucide-react'
import { memo } from 'react'

type IBaseExecutionProps = NodeProps & {
  icon: LucideIcon | string
  name: string
  description?: string
  children?: React.ReactNode
  //status?: NodeStatus;
  onSettings?: () => void
  onDoubleClick?: () => void
}

const BaseExecutionNode = memo(
  ({
    id,
    icon: Icon,
    name,
    description,
    children,
    onSettings,
    onDoubleClick,
    // ...rest
  }: IBaseExecutionProps) => {
    // TODO: add delete handler
    const handleDelete = () => {
      console.log('Delete node', id)
    }
    return (
      <WorkflowNode
        name={name}
        description={description}
        onSettings={onSettings}
        showToolbar
        // {...rest}
      >
        {/* TODO: Wrap inside NodeStatusIndicator */}
        <BaseNode onDoubleClick={onDoubleClick}>
          <BaseNodeContent>
            {typeof Icon === 'string' ? (
              <img src={Icon} alt={name} className='h-[16px] w-[16px]' />
            ) : (
              <Icon className='h-[16px] w-[16px]' />
            )}
            {children}
            <BaseHandle
              id={'target-1'}
              type='target'
              position={Position.Left}
            />
            <BaseHandle
              id={'source-1'}
              type='source'
              position={Position.Right}
            />
          </BaseNodeContent>
        </BaseNode>
      </WorkflowNode>
    )
  },
)
BaseExecutionNode.displayName = 'BaseExecutionNode'
export default BaseExecutionNode
