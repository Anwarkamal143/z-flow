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
