import { formatZodError } from '@/lib'
import { workflowClient } from '@/models/v1/Workflow.model'
import { toast } from 'sonner'
import {
  IUpdateWorkflowWithNodesEdges,
  UpdateWorkflowWithNodesEdgesSchema,
} from '../schema/workflow'

export function useCreateWorkflow() {
  return workflowClient.usePost({
    invalidateQueries: [
      {
        queryKey: ['list'],
        exact: false,
      },
    ],
  })
}
export function useUpdateWorkflowName() {
  const { handleUpdate, ...rest } = workflowClient.useUpdate({
    options: {
      path: 'name',
    },
    invalidateQueries: [
      {
        queryKey: ['list'],
        exact: false,
      },
    ],
  })

  const updateWorkflowName = async (workflowId: string, name?: string) => {
    if (
      name == null ||
      name.trim() == '' ||
      workflowId == null ||
      workflowId.trim() == ''
    ) {
      return
    }

    return await handleUpdate({
      id: workflowId,
      data: { name },
    })
  }

  return { updateWorkflowName, ...rest }
}
export function useUpdateWorkflow() {
  const { handleUpdate, ...rest } = workflowClient.useUpdate<
    null,
    IUpdateWorkflowWithNodesEdges
  >({
    invalidateQueries: [
      {
        queryKey: ['list'],
        exact: false,
      },
    ],
  })

  const updateWorkflow = async (workflow: IUpdateWorkflowWithNodesEdges) => {
    const result = UpdateWorkflowWithNodesEdgesSchema.safeParse(workflow)
    if (!result.success) {
      return {
        data: null,
        success: false,
        message: 'Invalid input',
        errorCode: 'VALIDATION_ERROR',
        metadata: {
          validationErrors: formatZodError(result.error),
        },
        statusText: 'Unprocessable Entity',
      }
    }

    return await handleUpdate({
      id: workflow.id,
      data: result.data,
    })
  }

  return { updateWorkflow, ...rest }
}
export function useDeleteWorkflows() {
  return workflowClient.useDelete({
    invalidateQueries: [
      {
        queryKey: ['list'],
        exact: false,
      },
    ],
  })
}

export function useExecuteWorkflow() {
  return workflowClient.usePost({
    options: {
      path: 'execute',
    },
    mutationOptions: {
      onSuccess: (data) => {
        toast.success(`Workflow "${data.data?.name}" executed`)
      },
      onError(error, variables, onMutateResult, context) {
        toast.error(
          `Failed to execute workflow: ${error.message || error.data.message}`,
        )
      },
    },
  })
}
