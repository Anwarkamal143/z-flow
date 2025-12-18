'use client'

import { InfoIcon } from '@/assets/icons'
import { useNetworkState } from 'react-use'
import Hint from './hint'

const NetWorkStatus = () => {
  const { online = true } = useNetworkState()

  if (!online) {
    return (
      <div className='bg-background text-foreground flex items-center justify-center overflow-hidden p-2'>
        <div className='flex flex-1 flex-col'>
          <span className='flex flex-1 items-center justify-center'>
            Connect to the internet
            <Hint label='Check your internet connection'>
              <InfoIcon className='ml-2 size-4' />
            </Hint>
          </span>
          <p className='text-muted-foreground text-center text-xs'>
            You&apos;re offline. Check your connection.
          </p>
        </div>
        {/* <Hint label="Close">
            <CrossIcon className="size-4 -rotate-45" onClick={setStatus} />
          </Hint> */}
      </div>
    )
  }
  return null
}

export default NetWorkStatus
