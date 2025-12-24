'use client'

import { PlusIcon } from '@/assets/icons'
import NodeSelector from '@/components/node-selector'
import { Button } from '@/components/ui/button'
import { memo, useState } from 'react'
const AddNodeButton = memo(() => {
  const [isSelectorOpen, setSelectorOpen] = useState(false)
  return (
    <NodeSelector open={isSelectorOpen} onOpenChange={setSelectorOpen}>
      <Button variant='outline' size={'icon'} onClick={() => {}}>
        <PlusIcon className='size-4' />
      </Button>
    </NodeSelector>
  )
})
AddNodeButton.displayName = 'AddNodeButton'
export default AddNodeButton
