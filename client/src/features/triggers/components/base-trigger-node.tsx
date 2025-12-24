'use client'

import { BaseHandle } from '@/components/react-flow/base-handle'
import { BaseNode, BaseNodeContent } from '@/components/react-flow/base-node'
import WorkflowNode from '@/components/workflow-node'
import { NodeProps, Position } from '@xyflow/react'
import { LucideIcon } from 'lucide-react'
import { memo } from 'react'

type IBaseTriggerProps = NodeProps & {
  icon: LucideIcon | string
  name: string
  description?: string
  children?: React.ReactNode
  //status?: NodeStatus;
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
    // ...rest
  }: IBaseTriggerProps) => {
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
        <BaseNode
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
      </WorkflowNode>
    )
  },
)
BaseTriggerNode.displayName = 'BaseTriggerNode'
export default BaseTriggerNode
