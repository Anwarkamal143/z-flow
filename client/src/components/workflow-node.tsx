import { SettingsIcon, TrashIcon } from '@/assets/icons'
import { NodeToolbar, Position } from '@xyflow/react'
import React from 'react'
import { Button } from './ui/button'

type IWorkflowNodeProps = {
  children: React.ReactNode
  showToolbar?: boolean
  name?: string
  onDelete?: () => void
  onSettings?: () => void
  description?: string
}

const WorkflowNode = ({
  children,
  showToolbar,
  name,
  onDelete,
  onSettings,
  description,
}: IWorkflowNodeProps) => {
  return (
    <>
      {showToolbar && (
        <NodeToolbar>
          <Button size={'sm'} variant={'ghost'} onClick={onSettings}>
            <SettingsIcon className='size-4' />
          </Button>
          <Button size={'sm'} variant={'ghost'} onClick={onDelete}>
            <TrashIcon className='size-4' />
          </Button>
        </NodeToolbar>
      )}
      {children}
      {name && (
        <NodeToolbar
          position={Position.Bottom}
          isVisible
          className='max-w-[200px] text-center'
        >
          <p className='font-medium'>{name}</p>
          {description && (
            <p className='text-muted-foreground truncate text-sm'>
              {description}
            </p>
          )}
        </NodeToolbar>
      )}
    </>
  )
}

export default WorkflowNode
