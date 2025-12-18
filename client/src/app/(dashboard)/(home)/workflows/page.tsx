import Dataloader from '@/components/loaders'
import { HydrateClient } from '@/components/server'
import { REFRESH_QUERY_KEY } from '@/config'
import Workflows, {
  WorkflowsContainer,
  WorksflowError,
  WorksflowLoading,
} from '@/features/workflows/components/workflows'
import { prefetchServerWorkflows } from '@/features/workflows/server/prefetch'
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

  const resp = await authSession(params)
  if (params?.[REFRESH_QUERY_KEY]) {
    return <Dataloader />
  }

  void prefetchServerWorkflows(resp?.cookie, {
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
