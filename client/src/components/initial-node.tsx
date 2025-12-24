'use client'

import { PlusIcon } from '@/assets/icons'
import { NodeProps } from '@xyflow/react'
import { memo, useState } from 'react'
import NodeSelector from './node-selector'
import { PlaceholderNode } from './react-flow/placeholder-node'
import WorkflowNode from './workflow-node'

export const InitialNode = memo((props: NodeProps) => {
  const [isSelectorOpen, setSelectorOpen] = useState(false)
  return (
    <NodeSelector open={isSelectorOpen} onOpenChange={setSelectorOpen}>
      <WorkflowNode showToolbar={false}>
        <PlaceholderNode
          {...props}
          onClick={() => {
            setSelectorOpen(true)
          }}
        >
          <div className='flex cursor-pointer items-center justify-center'>
            <PlusIcon className='size-4' />
          </div>
        </PlaceholderNode>
      </WorkflowNode>
    </NodeSelector>
  )
})
InitialNode.displayName = 'InitialNode'
