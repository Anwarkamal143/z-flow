import SignUpScreen from '@/features/auth/components/sign-up'
import { requireUnAuth } from '@/lib/auth/auth'

const SignUpPage = async () => {
  await requireUnAuth()

  return <SignUpScreen />
}

export default SignUpPage
