'use client'

import { EmailIcon, EyeIcon, EyeOffIcon } from '@/assets/icons'
import ButtonLoader from '@/components/button-loader'
import Form from '@/components/form/Form'
import FormInput from '@/components/form/Input'
import { useRequireUnAuthClient } from '@/hooks/useAuthGuard'
import useZodForm from '@/hooks/useZodForm'
import { useStoreAuthActions } from '@/store/userAuthStore'
import { useRouter } from 'next/navigation'
import { parseAsBoolean, useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useSignOut } from '../api'
import { useSignIn } from '../api/hooks'
import { SIGN_IN_SCHEMA, SignInSchemaType } from '../schema'
import AuthForm from './AuthForm'

/* ------------------------- Component Props ------------------------- */

/* ---------------------------- Component ---------------------------- */
const SignInScreen = ({}) => {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const [isSocialLogginIn, setIsSocialLogginIn] = useState(false)
  const [isSigningOUt, setSignout] = useQueryState(
    'signout',
    parseAsBoolean
      .withOptions({
        history: 'push',
        clearOnDefault: true,
      })
      .withDefault(false),
  )
  const setUser = useStoreAuthActions().setUser
  const { loading, user } = useRequireUnAuthClient(!isSigningOUt)
  const { handleSignIn } = useSignIn()
  const { signOut } = useSignOut()
  const handleSignout = async () => {
    if (!user) {
      setSignout(null)
      return
    }
    await signOut(false)
    setSignout(null)
  }
  const form = useZodForm({
    schema: SIGN_IN_SCHEMA,
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const onSubmit = async (e: SignInSchemaType) => {
    try {
      const parseResult = SIGN_IN_SCHEMA.safeParse(e)
      if (!parseResult.success) {
        toast.error('Please provide a valid data')
        return {
          message: parseResult.error.message,
          error: true,
          success: false,
        }
      }
      const { data, message } = await handleSignIn(e)

      if (data?.id) {
        toast.success(message)
        const { accessToken, refreshToken, accounts = [], ...rest } = data
        setUser({
          user: rest,
          accounts: accounts,
          isAuthenticated: true,
          isLoggedIn: true,
          isAuthenticating: false,

          accessToken,
          refreshToken,
        })
        router.replace('/')
      } else {
        toast.error(message)
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }
  useEffect(() => {
    if (isSigningOUt) {
      handleSignout()
    }

    return () => {}
  }, [loading, user])

  const { formState } = form
  const isFormSubmitting = formState.isSubmitting || isSocialLogginIn
  // bg-[url(/img/auth-bg.jpg)] bg-cover
  return (
    <AuthForm
      mode='signin'
      title='Welcome back!'
      description='Sign in to your account using your email or continue with social login.'
      isSubmitting={isFormSubmitting}
    >
      <Form form={form} onSubmit={onSubmit} className='grid gap-4'>
        <FormInput
          label='Email'
          name='email'
          type='email'
          placeholder='you@example.com'
          leftIcon={{ Comp: <EmailIcon /> }}
        />

        <FormInput
          label='Password'
          name='password'
          type={showPassword ? 'text' : 'password'}
          placeholder='********'
          rightIcon={{
            Comp: !showPassword ? EyeIcon : EyeOffIcon,
            onClick: () => setShowPassword(!showPassword),
          }}
        />

        <ButtonLoader
          type='submit'
          className='mt-2'
          disabled={isFormSubmitting}
        >
          Sign In
        </ButtonLoader>
      </Form>
    </AuthForm>
  )
}

export default SignInScreen
