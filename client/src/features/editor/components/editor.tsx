'use client'

import {
  EmptySingleView,
  ErrorView,
  LoadingView,
} from '@/components/entity-components'
import FlowContainer from '@/components/react-flow'
import { FlowContext } from '@/context/flow-context'
import { useDeleteNode } from '@/features/nodes/api/mutation-hooks'
import { useGetSuspenseWorkflow } from '@/features/workflows/api'
import useSocket from '@/hooks/useSocket'
import { useStoreWorkflowActions } from '@/store/useEditorStore'
import { Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type IEditorProps = {
  workflowId: string
}

const Editor = ({ workflowId }: IEditorProps) => {
  const { setWorkflow } = useStoreWorkflowActions()
  const { socket, isConnected } = useSocket()
  const { handleDelete } = useDeleteNode(workflowId)
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
  const handleNodeDelete = async (nodes: Node[]) => {
    await handleDelete({
      payload: { id: workflowId },
      reqOptions: {
        path: 'workflow',
        query: {
          nodeIds: nodes.map((n) => n.id),
        },
      },
    })
  }

  if (!data?.data) {
    return <EditorSingleEmptyView />
  }
  return (
    <div className='h-full w-full'>
      <FlowContext.Provider value={{ workflowId, workflow: data.data }}>
        <FlowContainer
          nodes={data.data.nodes}
          edges={data.data.edges}
          workflowId={workflowId}
          onNodesDelete={handleNodeDelete}
        />
      </FlowContext.Provider>
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
