import React from 'react'

import Dataloader from '@/components/loaders'
import {
  useStoreUser,
  useStoreUserIsAuthenticating,
} from '@/store/userAuthStore'
import { redirect } from 'next/navigation'

export function withAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>,
) {
  return function AuthHOC(props: T) {
    const user = useStoreUser()
    const isAuthenticating = useStoreUserIsAuthenticating()

    // 1. Show loader while authenticating
    if (isAuthenticating) {
      return <Dataloader />
    }
    // 2. Redirect if not authenticated
    if (!user?.id) {
      return redirect('/login')
    }

    // 3. Authenticated → return wrapped component with user
    return <WrappedComponent {...props} user={user} />
  }
}
