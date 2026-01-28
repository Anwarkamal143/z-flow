import { UpdateNodeSchema } from '@/features/workflows/schema/node'
import { formatZodError } from '@/lib'
import { ErrorCode } from '@/lib/error-code.enum'
import { nodeClient } from '@/models/v1'
import { IUpdateNode } from '@/types/Inode'

export function useCreateNode() {
  return nodeClient.useCreate({
    invalidateQueries: [
      {
        queryKey: ['list'],
        exact: false,
      },
    ],
  })
}
export function useDeleteNode() {
  return nodeClient.useDelete({
    invalidateQueries: [
      {
        queryKey: ['list'],
        exact: false,
      },
    ],
  })
}

export function useUpdateNode() {
  const { handleUpdate, ...rest } = nodeClient.useUpdate({
    invalidateQueries: [
      {
        queryKey: ['list'],
        exact: false,
      },
      {
        queryKey: (data, params) => {
          return [params?.data.id]
        },
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
