'use client'
import { workflowClient, WorkflowClientListOptions } from '@/models'
import { useSuspnseOffsetPagination } from '@/queries/pagination/hooks'
import { SingleQueryOptions } from '@/queries/v1/types'
import {
  getWorkflowListQueryOptions,
  getWorkflowQueryOptions,
} from './query-options'

export const useGetSuspenseWorkflow = (
  opts: SingleQueryOptions<IWorkflow, IWorkflow, true> = {},
) =>
  workflowClient.useSuspenseGet({
    ...opts,
    queryKey: getWorkflowQueryOptions({ ...opts }).queryKey,
  })

export const useSuspenseOffsetWorkflows = <
  T extends WorkflowClientListOptions<'offset', true> =
    WorkflowClientListOptions<'offset', true>,
>(
  props?: T,
) => {
  const mode = 'offset'
  return useSuspnseOffsetPagination(workflowClient, {
    ...getWorkflowListQueryOptions<'offset', true>({
      ...props,
      mode,
      params: {
        includeTotal: true,
        ...(props?.params || {}),
        mode,
      },
    }),
  })
}
