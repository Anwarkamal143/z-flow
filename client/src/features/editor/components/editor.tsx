'use client'

import {
  EmptySingleView,
  ErrorView,
  LoadingView,
} from '@/components/entity-components'
import FlowContainer from '@/components/react-flow'
import { useGetSuspenseWorkflow } from '@/features/workflows/api'
import useSocket from '@/hooks/useSocket'
import { useStoreWorkflowActions } from '@/store/useEditorStore'
import '@xyflow/react/dist/style.css'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type IEditorProps = {
  workflowId: string
}

const Editor = ({ workflowId }: IEditorProps) => {
  const { setWorkflow } = useStoreWorkflowActions()
  const { socket, isConnected } = useSocket()
  const { data } = useGetSuspenseWorkflow({
    id: workflowId,
    isEnabled: !!workflowId,
    queryOptions: {
      select(data) {
        if (data.data) {
          setWorkflow(data.data)
        }
        return data
      },
    },
  })
  useEffect(() => {
    if (workflowId) {
      socket?.emit('join', workflowId)
    }
    return () => {
      socket?.emit('leave', workflowId)
    }
  }, [workflowId, isConnected])
  if (!data?.data) {
    return <EditorSingleEmptyView />
  }

  return (
    <div className='h-full w-full'>
      <FlowContainer
        nodes={data.data.nodes}
        edges={data.data.edges}
        workflowId={workflowId}
      />
    </div>
  )
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
