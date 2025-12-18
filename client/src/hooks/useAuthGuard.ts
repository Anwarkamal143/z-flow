import { Role } from '@/config/enums'
import {
  useStoreUser,
  useStoreUserIsAuthenticating,
} from '@/store/userAuthStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuthGuard(requiredRoles?: Role[]) {
  const router = useRouter()
  const user = useStoreUser()
  const isAuthenticating = useStoreUserIsAuthenticating()

  // Redirect logic
  useEffect(() => {
    if (!isAuthenticating) {
      if (!user?.id) {
        router.replace('/login')
      } else if (requiredRoles && !requiredRoles.includes(user.role)) {
        router.replace('/unauthorize')
      }
    }
  }, [isAuthenticating, user, requiredRoles])

  if (isAuthenticating) return { loading: true, user: null }

  if (!user?.id) return { loading: false, user: null }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return { loading: false, user: null }
  }

  return { loading: false, user }
}
export function useRequireUnAuthClient() {
  const router = useRouter()
  const user = useStoreUser()
  const isAuthenticating = useStoreUserIsAuthenticating()

  // Redirect logic
  useEffect(() => {
    if (!isAuthenticating) {
      if (user?.id) {
        router.replace('/')
      }
    }
  }, [isAuthenticating, user])

  if (isAuthenticating) return { loading: true, user: null }

  if (!user?.id) return { loading: false, user: null }

  return { loading: false, user }
}
