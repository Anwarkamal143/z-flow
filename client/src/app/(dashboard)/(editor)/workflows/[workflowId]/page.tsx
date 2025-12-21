import Dataloader from '@/components/loaders'
import { HydrateClient } from '@/components/server'
import Editor, {
  EditorError,
  EditorLoading,
} from '@/features/editor/components/editor'
import EditorHeader from '@/features/editor/components/editor-header'
import { prefetchServerWorkflow } from '@/features/workflows/server/prefetch'
import { isAccessTokenRefresing } from '@/lib'
import { authSession } from '@/lib/auth/auth'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

type IPageProps = {
  params: Promise<{ workflowId: string }>
}

const WorkflowPage = async (props: IPageProps) => {
  await authSession()
  const params = await props.params
  const { workflowId } = params
  if (isAccessTokenRefresing(params)) {
    return <Dataloader />
  }
  prefetchServerWorkflow(workflowId)
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EditorError />}>
        <Suspense fallback={<EditorLoading />}>
          <>
            <EditorHeader workflowId={workflowId} />
            <main className='flex-1'>
              <Editor workflowId={workflowId} />
            </main>
          </>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  )
}

export default WorkflowPage
