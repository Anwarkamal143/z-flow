'use client'
import Form from '@/components/form/Form'
import { FormInput } from '@/components/form/Input'
import useZodForm from '@/hooks/useZodForm'

import ButtonLoader from '@/components/button-loader'
import { useRequireUnAuthClient } from '@/hooks/useAuthGuard'
import { useStoreAuthActions } from '@/store/userAuthStore'
import { IUser } from '@/types/user'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useRegisterUser } from '../api/hooks'
import { SIGN_UP_SCHEMA, SignUpSchemaType } from '../schema'
import AuthForm from './AuthForm'

const SignUpScreen = () => {
  useRequireUnAuthClient()
  const router = useRouter()
  // useIsAuth(true);
  const form = useZodForm({
    schema: SIGN_UP_SCHEMA,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })
  const setUser = useStoreAuthActions().setUser
  const { handleRegister } = useRegisterUser()

  const onSubmit = async (e: SignUpSchemaType) => {
    try {
      const result = await handleRegister(e)
      if (result.success) {
        toast.success(result.message)
        setUser({
          user: result.data as IUser,
          isAuthenticated: true,
          isLoggedIn: true,
          isAuthenticating: false,
        })
        return router.replace('/')
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
    }
  }

  return (
    <AuthForm
      mode='signup'
      title='Create an account'
      description='Sign up to get started!'
      isSubmitting={false}
    >
      <Form form={form} onSubmit={onSubmit} className='grid gap-4'>
        <FormInput label='Name' name='name' placeholder='John' />
        <FormInput
          label='Email'
          name='email'
          type='email'
          placeholder='you@example.com'
        />

        <FormInput
          label='Password'
          name='password'
          type='password'
          placeholder='********'
          autoComplete='new-password'
        />
        <FormInput
          label='Confirm password'
          name='confirmPassword'
          type='password'
          placeholder='********'
          autoComplete='new-password'
        />

        <ButtonLoader
          type='submit'
          className='mt-2'
          disabled={form.formState.isSubmitting}
        >
          Sign Up
        </ButtonLoader>
      </Form>
    </AuthForm>
  )
}

export default SignUpScreen
