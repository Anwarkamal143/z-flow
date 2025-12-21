import Dataloader from '@/components/loaders'
import { HydrateClient } from '@/components/server'
import Workflows, {
  WorkflowsContainer,
  WorksflowError,
  WorksflowLoading,
} from '@/features/workflows/components/workflows'
import { prefetchServerWorkflows } from '@/features/workflows/server/prefetch'
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
  await authSession(params)
  if (isAccessTokenRefresing(params)) {
    return <Dataloader />
  }

  void prefetchServerWorkflows({
    params: {
      ...parseServerPaginationParams({ ...params, includeTotal: 'true' }),
    },
  })
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<WorksflowError />}>
        <Suspense fallback={<WorksflowLoading />}>
          <WorkflowsContainer>
            <Workflows />
          </WorkflowsContainer>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  )
}

export default WorkFlowPage
