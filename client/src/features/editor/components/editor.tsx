'use client'

import {
  EmptySingleView,
  ErrorView,
  LoadingView,
} from '@/components/entity-components'
import { useGetSuspenseWorkflow } from '@/features/workflows/api'
import { useRouter } from 'next/navigation'

type IEditorProps = {
  workflowId: string
}

const Editor = ({ workflowId }: IEditorProps) => {
  const { data } = useGetSuspenseWorkflow({
    id: workflowId,
    isEnabled: !!workflowId,
  })
  if (!data?.data) {
    return <EditorSingleEmptyView />
  }
  return <div>{JSON.stringify(data)}</div>
}

export default Editor
export const EditorLoading = () => {
  return <LoadingView message='Loading editor...' />
}
export const EditorError = () => {
  return <ErrorView message='Error loading editor.' />
}
export const EditorSingleEmptyView = () => {
  const router = useRouter()
  return (
    <div className='mx-auto flex h-full w-full max-w-2xl items-center'>
      <EmptySingleView
        message='Nothing Found with this Id'
        onActionClick={() => {
          router.push('/workflows')
        }}
      />
    </div>
  )
}
