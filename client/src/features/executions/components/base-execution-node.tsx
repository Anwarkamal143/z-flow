'use client'

import { BaseHandle } from '@/components/react-flow/base-handle'
import { BaseNode, BaseNodeContent } from '@/components/react-flow/base-node'
import {
  NodeStatus,
  NodeStatusIndicator,
} from '@/components/react-flow/node-status-indicator'
import WorkflowNode from '@/components/workflow-node'
import useInitialNode from '@/hooks/useInitialNode'
import { cn } from '@/lib/utils'
import { NodeProps, Position, useReactFlow } from '@xyflow/react'
import { LucideIcon } from 'lucide-react'
import {
  cloneElement,
  ElementType,
  isValidElement,
  memo,
  ReactElement,
} from 'react'

type IBaseExecutionProps = NodeProps & {
  icon: ElementType | ReactElement | string | LucideIcon
  name: string
  description?: string
  children?: React.ReactNode
  status?: NodeStatus
  onSettings?: () => void
  onDoubleClick?: () => void
}
const isIconProps = (
  v: unknown,
): v is Omit<IBaseExecutionProps['icon'], 'string'> =>
  typeof v === 'object' && v !== null && ('render' in v || 'Comp' in v)

const BaseExecutionNode = memo(
  ({
    id,
    icon: Icon,
    name,
    description,
    children,
    onSettings,
    onDoubleClick,
    status,
    // ...rest
  }: IBaseExecutionProps) => {
    const { setNodes, setEdges } = useReactFlow()
    const { getInitialNode } = useInitialNode()

    const renderComponent = (
      comp?: Omit<IBaseExecutionProps['icon'], 'string'>,
    ): any => {
      if (!comp) return null

      /** ✅ Comp as JSX element */
      if (isValidElement(comp)) {
        return cloneElement(comp, {
          className: cn('h-[16px] w-[16px]', (comp as any)?.props?.className),
        } as any)
      }

      /** ✅ Comp as component type */
      const Component = comp as ElementType
      return <Component className='h-[16px] w-[16px]' />
    }
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
        <NodeStatusIndicator status={status} variant='border'>
          <BaseNode onDoubleClick={onDoubleClick} status={status}>
            <BaseNodeContent>
              {typeof Icon === 'string' ? (
                <img src={Icon} alt={name} className='h-[16px] w-[16px]' />
              ) : (
                // <Icon className='h-[16px] w-[16px]' />
                <>{renderComponent(Icon as any)}</>
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
        </NodeStatusIndicator>
      </WorkflowNode>
    )
  },
)
BaseExecutionNode.displayName = 'BaseExecutionNode'
export default BaseExecutionNode
