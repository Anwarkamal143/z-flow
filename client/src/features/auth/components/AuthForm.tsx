'use client'

import { z } from 'zod'

import { GoogleIcon } from '@/assets/icons'
import SeparatorText from '@/components/separator-text'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { API_BASE_URL } from '@/config'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

/* -------------------------- Zod Validation -------------------------- */
const authSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
})

type AuthFormValues = z.infer<typeof authSchema>

/* ------------------------- Component Props ------------------------- */
interface AuthFormProps {
  mode?: 'signin' | 'signup'
  children?: React.ReactNode
  title?: string
  description?: string
  isSubmitting?: boolean
}

/* ---------------------------- Component ---------------------------- */
const SignInScreen = ({
  mode = 'signin',
  title,
  description,
  children,
  isSubmitting,
}: AuthFormProps) => {
  const router = useRouter()
  const [isSocialLogginIn, setIsSocialLogginIn] = useState(false)

  const SignInWithG = async () => {
    try {
      setIsSocialLogginIn(true)
      window.location.href = `${API_BASE_URL}/google`
    } catch {
    } finally {
      setIsSocialLogginIn(false)
    }
  }
  // bg-[url(/img/auth-bg.jpg)] bg-cover
  return (
    <div className='flex h-screen items-center justify-center'>
      <Card className='mx-auto my-auto w-full max-w-md border border-gray-200 shadow-lg dark:border-gray-700'>
        <CardHeader className='space-y-1 text-center'>
          <CardTitle className='text-2xl font-bold'>{title}</CardTitle>
          <CardDescription className='text-muted-foreground text-sm'>
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* ---------- OAuth Buttons ---------- */}
          <div className='grid gap-3'>
            <Button
              variant='outline'
              className='hover:bg-primary hover:text-primary-foreground flex cursor-pointer justify-center gap-2'
              onClick={() => SignInWithG()}
              disabled={isSubmitting || isSocialLogginIn}
            >
              <GoogleIcon />
              Continue with Google
            </Button>
          </div>

          <SeparatorText className='my-4 w-full text-center' text='OR' />

          {/* ---------- Email / Password Form ---------- */}

          {children}
          {/* ---------- Switch Mode Link ---------- */}
          <div className='my-2 flex justify-center gap-1 pt-1 text-sm'>
            <span className='text-gray-400'>
              {mode === 'signin'
                ? "Don't have an account?"
                : 'Already have an account?'}{' '}
            </span>
            <Link
              href={mode === 'signin' ? '/sign-up' : 'login'}
              className='text-primary hover:underline'
              aria-disabled={isSubmitting || isSocialLogginIn}
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignInScreen
