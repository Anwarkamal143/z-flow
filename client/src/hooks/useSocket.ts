import { ISocketContextProps, SocketContext } from '@/context/socket'
import { useContext } from 'react'

const useSocket = () => {
  const socket = useContext(SocketContext) as ISocketContextProps

  if (!socket) {
    throw new Error('useSocket must be used inside SocketProvider')
  }

  return socket
}

export default useSocket
