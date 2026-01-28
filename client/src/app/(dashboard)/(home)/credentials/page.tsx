import Dataloader from '@/components/loaders'
import { HydrateClient } from '@/components/server'
import Credentials, {
  CredentialsContainer,
  CredentialsError,
  CredentialsLoading,
} from '@/features/credentials/components/credentials'

import { prefetchServerCredentials } from '@/features/credentials/server/prefetch'
import { isAccessTokenRefresing } from '@/lib'
import { authSession } from '@/lib/auth/auth'
import { parseServerPaginationParams } from '@/queries/pagination/server/pagination-params'
import { SearchParams } from 'nuqs/server'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
type Props = {
  searchParams: Promise<SearchParams>
}

const WorkFlowPage = async (props: Props) => {
  const params = await props.searchParams
  if (isAccessTokenRefresing(params)) {
    return <Dataloader />
  }
  await authSession(params)

  void prefetchServerCredentials({
    params: {
      ...parseServerPaginationParams({ ...params, includeTotal: 'false' }),
    },
  })
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<CredentialsError />}>
        <Suspense fallback={<CredentialsLoading />}>
          <CredentialsContainer>
            <Credentials />
          </CredentialsContainer>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  )
}

export default WorkFlowPage
