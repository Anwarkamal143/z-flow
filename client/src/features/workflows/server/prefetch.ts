'use server'
import { optionsWithCookies } from '@/lib'
import { getCookieAsString } from '@/lib/auth/server-utils'
import {
  workflowClient,
  WorkflowClientListOptions,
} from '@/models/v1/Workflow.model'
import {
  getWorkflowListQueryOptions,
  getWorkflowQueryOptions,
} from '../api/query-options'

export const prefetchServerWorkflows = async (
  props: WorkflowClientListOptions<'offset', false> = {},
  cookies: string | undefined = undefined,
) => {
  const cokies = cookies || (await getCookieAsString())
  const queryOptions = {
    ...getWorkflowListQueryOptions<'offset', false>(),
    ...props,
  }
  workflowClient.prefetchList({
    ...queryOptions,
    options: optionsWithCookies(queryOptions.options, cokies),
  })
}
export const prefetchServerWorkflow = async (
  id: string,
  cookies: string | undefined = undefined,
) => {
  const cokies = cookies || (await getCookieAsString())

  const queryOptions = { ...getWorkflowQueryOptions() }

  workflowClient.prefetchGet({
    ...queryOptions,
    id,
    options: optionsWithCookies(queryOptions.options, cokies),
  })
}
