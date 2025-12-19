'use client'
import { workflowClient, WorkflowClientListOptions } from '@/models'
import {
  useOffsetPaginationList,
  useSuspnseOffsetPagination,
} from '@/queries/pagination/hooks'
import getQueryFn from '@/queries/useQueryFn'
import { getWorkflowListQueryOptions } from './query-options'

export const useSuspenseCursorListWorkflows = getQueryFn(
  workflowClient.useInfiniteList,
)
export const useOffsetGetAllWorkflows = (
  props: WorkflowClientListOptions<'offset'>,
) => {
  return useOffsetPaginationList(workflowClient, {
    ...getWorkflowListQueryOptions(),
    ...props,
  })
}

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
