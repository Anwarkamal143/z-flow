'use client'

import { PlusIcon } from '@/assets/icons'
import { Button } from '@/components/ui/button'
import { memo } from 'react'
const AddNodeButton = memo(() => {
  return (
    <Button variant='outline' size={'icon'} onClick={() => {}}>
      <PlusIcon className='size-4' />
    </Button>
  )
})
AddNodeButton.displayName = 'AddNodeButton'
export default AddNodeButton
