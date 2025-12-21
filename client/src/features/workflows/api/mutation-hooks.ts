import { workflowClient } from '@/models/v1/Workflow.model'

export function useCreateWorkflow() {
  return workflowClient.useCreate({
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
