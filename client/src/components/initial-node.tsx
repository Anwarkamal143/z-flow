'use client'

import { PlusIcon } from '@/assets/icons'
import { NodeProps } from '@xyflow/react'
import { memo } from 'react'
import { PlaceholderNode } from './react-flow/placeholder-node'
import WorkflowNode from './workflow-node'

export const InitialNode = memo((props: NodeProps) => {
  return (
    <WorkflowNode>
      <PlaceholderNode
        {...props}
        onClick={() => {
          console.log('clicked')
        }}
      >
        <div className='flex cursor-pointer items-center justify-center'>
          <PlusIcon className='size-4' />
        </div>
      </PlaceholderNode>
    </WorkflowNode>
  )
})
InitialNode.displayName = 'InitialNode'
