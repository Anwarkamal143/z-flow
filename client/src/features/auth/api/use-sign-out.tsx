import { appSignOutCleanup, withErrorHandler } from '@/lib'
import { authClient } from '@/models'
import { AUTH_PATHS } from '../paths'

const useSignOut = () => {
  const {
    isPending: isLoading,
    mutateAsync,
    error,
  } = authClient.usePost({
    options: {
      path: AUTH_PATHS.signOut,
    },
  })

  const signOut = withErrorHandler(async (redirect: boolean = true) => {
    try {
      const resp = await mutateAsync({})
      if (redirect && resp?.success) {
        await appSignOutCleanup()
        return
      }
      if (resp?.success) {
        return true
      }
      return false
    } catch {
      return false
    }
  })

  return { signOut, error, isSigningOut: isLoading }
}

export default useSignOut
