import { useStoreAuthActions } from '@/store/userAuthStore'

import { withErrorHandler } from '@/lib'
import { authClient } from '@/models'
import { SignInSchemaType, SignUpSchemaType } from '../schema'

const AUTH_QUERY_PATHS = {
  register: 'register',
  login: 'login',
}

export function useSignIn() {
  const { mutateAsync, isError, isPending, isSuccess, error } =
    authClient.usePost<{ accessToken: string; refreshToken: string }>({
      options: {
        path: 'login',
      },
    })

  const handleSignIn = withErrorHandler(async (data: SignInSchemaType) => {
    const res = await mutateAsync({
      payload: { ...data },
    })

    return res
  })
  return { handleSignIn, isError, isPending, isSuccess, error }
}

type ITokens = { accessToken: string; refreshToken: string }
export function useRegisterUser() {
  const { setTokens } = useStoreAuthActions()
  const { mutateAsync, isError, isPending, isSuccess, error } =
    authClient.usePost<ITokens>({
      options: {
        path: AUTH_QUERY_PATHS.register,
      },
    })

  const handleRegister = async (data: SignUpSchemaType) => {
    const res = await mutateAsync({
      payload: { ...data },
    })
    if (res.data) {
      const { accessToken, refreshToken } = res.data
      setTokens({
        accessToken: accessToken,
        refreshToken,
        isRefreshing: false,
      })
    }
    return res
  }

  return { handleRegister, isError, isPending, isSuccess, error }
}
