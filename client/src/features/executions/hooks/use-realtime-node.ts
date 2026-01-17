import { NODE_STATUSES } from '@/config/node-components'
import useSocket from '@/hooks/useSocket'
import { useCallback, useEffect, useState } from 'react'

type IUseNodeStatusProps = {
  nodeId: string
  event: string
}

export default function useRealtimeNode({
  nodeId,
  event,
}: IUseNodeStatusProps) {
  const [status, setStatus] = useState(NODE_STATUSES.initial)
  const { socket, isConnected } = useSocket()
  const responseHandler = useCallback(
    (data: any) => {
      const { nodeId: nId, status } = data
      if (nodeId == nId) {
        setStatus(status)
      }
    },
    [nodeId],
  )
  useEffect(() => {
    if (nodeId && event) {
      socket?.on(event, responseHandler)
    }

    return () => {
      socket?.off(event, responseHandler)
    }
  }, [event, nodeId, isConnected])

  return status
}
