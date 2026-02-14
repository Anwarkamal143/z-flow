import { UpdateNodeSchema } from '@/features/workflows/schema/node'
import { deepClone, formatZodError } from '@/lib'
import { ErrorCode } from '@/lib/error-code.enum'
import { nodeClient } from '@/models/v1'
import { INode, IUpdateNode } from '@/types/Inode'

export function useCreateNode() {
  return nodeClient.usePost({
    invalidateQueries: [
      {
        queryKey: ['list'],
        exact: false,
      },
      {
        queryKey: (data, params) => {
          return [data?.workflowId, 'get']
        },
        exact: false,
        prefixEntity: false,
        predicate: true,
      },
    ],
  })
}
export function useDeleteNode(workflowId?: string) {
  return nodeClient.useDelete({
    optimisticUpdate: [
      {
        queryKey() {
          return [workflowId, 'get']
        },
        predicate: !!workflowId,
        prefixEntity: false,
        updateFn(oldData, newData) {
          const workflowData = deepClone(oldData)
          if (!!workflowData?.data?.nodes?.length) {
            const newNodes = workflowData?.data.nodes.filter((n: INode) => {
              return n.id != newData.payload?.id
            })
            workflowData.data.nodes = newNodes
          }
          return workflowData
        },
      },
    ],
    invalidateQueries: [
      {
        queryKey: ['list'],
        exact: false,
      },

      {
        queryKey: (data, params) => {
          return [data?.id, 'get']
        },
        exact: false,
        prefixEntity: false,
        predicate: true,
      },
    ],
  })
}

export function useUpdateNode(workflowId?: string) {
  const { handleUpdate, ...rest } = nodeClient.useUpdate({
    optimisticUpdate: [
      {
        queryKey(vars, ctx) {
          return [vars?.id, 'get']
        },
        updateFn(oldData, newData) {
          const nodeData = deepClone(oldData)
          if (newData?.data && nodeData?.data) {
            nodeData.data = {
              ...(nodeData.data || {}),
              ...(newData.data || {}),
            }
          }
          return nodeData
        },
      },
      {
        queryKey(vars, ctx) {
          return [workflowId, 'get']
        },
        predicate: !!workflowId,
        prefixEntity: false,
        updateFn(oldData, newData) {
          const workflowData = deepClone(oldData)
          if (!!workflowData?.data?.nodes?.length) {
            const newNodes = workflowData?.data.nodes.map((n: INode) => {
              if (n.id == newData.id) {
                return { ...n, ...newData.data }
              }

              return n
            })
            workflowData.data.nodes = newNodes
          }
          return workflowData
        },
      },
    ],
    invalidateQueries: [
      {
        queryKey: ['list'],
        exact: false,
      },
    ],
  })

  const updateNode = async (node: IUpdateNode) => {
    const result = UpdateNodeSchema.safeParse(node)
    if (!result.success) {
      return {
        data: null,
        success: false,
        message: 'Invalid input',
        errorCode: ErrorCode.VALIDATION_ERROR,
        metadata: {
          validationErrors: formatZodError(result.error),
        },
        statusText: 'Unprocessable Entity',
      }
    }
    const data = result.data as IUpdateNode
    return await handleUpdate({
      id: node.id,
      data,
    })
  }

  return { updateNode, ...rest }
}
