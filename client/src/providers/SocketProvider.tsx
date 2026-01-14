'use client'
import { SOCKET_URL } from '@/config'
import { SocketContext } from '@/context/socket'
import {
  useAuthAccessToken,
  useAuthIsTokensRefreshing,
  useStoreUserIsAuthenticated,
} from '@/store/userAuthStore'
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { io, Socket } from 'socket.io-client'

export default function SocketContextProvider({
  children,
}: {
  children: ReactNode
}) {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const isAuthenticated = useStoreUserIsAuthenticated()
  const accessToken = useAuthAccessToken()
  const isTokenRefreshing = useAuthIsTokensRefreshing()
  const isAllowConnection = useMemo(() => {
    return isAuthenticated && accessToken && !isTokenRefreshing
  }, [isAuthenticated, accessToken, isTokenRefreshing])
  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('connect')
      socketRef.current.off('disconnect')
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setIsConnected(false)
    reconnectAttemptsRef.current = 0
  }, [])
  console.log(isConnected, 'isConnected')
  const initializeSocket = useCallback(() => {
    // Don't initialize if already connected or no token
    if (socketRef.current?.connected) {
      return
    }
    // Cleanup existing socket
    cleanupSocket()
    // Create new socket connection
    const newSocket = io(SOCKET_URL, {
      auth: { token: accessToken },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 2000,
    })
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      setIsConnected(true)
      reconnectAttemptsRef.current = 0
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setIsConnected(false)

      // Prevent infinite reconnection when unauthorized
      if (
        reason === 'io server disconnect' ||
        reason === 'io client disconnect'
      ) {
        reconnectAttemptsRef.current = maxReconnectAttempts
      }
    })
    newSocket.on('error', (error) => {
      if (error.code === 'RATE_LIMIT') {
        // Handle rate limiting error
        console.error('Rate limit exceeded')
      }
    })
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      reconnectAttemptsRef.current++

      // Don't retry if token is invalid/expired
      if (error.message.includes('auth') || error.message.includes('token')) {
        reconnectAttemptsRef.current = maxReconnectAttempts
        return
      }
    })

    newSocket.on('app:ping', (data, ack) => {
      console.log('Received ping:', data)
      ack?.('OK')
    })

    socketRef.current = newSocket
  }, [accessToken, cleanupSocket])

  useEffect(() => {
    // Only attempt connection when authenticated and not refreshing token
    if (isAllowConnection) {
      initializeSocket()
    } else {
      // Cleanup if not authenticated
      cleanupSocket()
    }

    return cleanupSocket
  }, [
    isAuthenticated,
    accessToken,
    isTokenRefreshing,
    initializeSocket,
    cleanupSocket,
    isAllowConnection,
  ])

  return (
    <SocketContext.Provider
      value={{
        // eslint-disable-next-line react-hooks/refs
        socket: socketRef.current,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
