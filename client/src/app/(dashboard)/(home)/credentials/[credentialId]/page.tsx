import Dataloader from '@/components/loaders'
import { HydrateClient } from '@/components/server'
import { CredentialView } from '@/features/credentials/components/credential'
import {
  CredentialsError,
  CredentialsLoading,
} from '@/features/credentials/components/credentials'
import { prefetchServerCredential } from '@/features/credentials/server/prefetch'
import { isAccessTokenRefresing } from '@/lib'
import { authSession } from '@/lib/auth/auth'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

type PageProps = {
  params: Promise<{ credentialId: string }>
  searchParams: Promise<Record<string, string>>
}

const CredentaialPage = async (props: PageProps) => {
  const searchParams = await props.searchParams
  const params = await props.params
  if (isAccessTokenRefresing(searchParams)) {
    return <Dataloader />
  }
  await authSession(params)
  const credentialId = params.credentialId
  prefetchServerCredential(credentialId)
  return (
    <div className='h-full p-4 md:px-10 md:py-6'>
      <div className='mx-auto flex h-full w-full max-w-6xl flex-col gap-y-8'>
        <HydrateClient>
          <ErrorBoundary
            fallback={<CredentialsError message='Error loading credential' />}
          >
            <Suspense
              fallback={<CredentialsLoading message='Loading credential...' />}
            >
              <CredentialView credentialId={credentialId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  )
}

export default CredentaialPage
