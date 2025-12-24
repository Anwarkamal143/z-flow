import { WorkFlowClientEntity, WorkFlowClientPartialEntity } from '@/models'
import {
  IListCallOptions,
  IPaginationModes,
  SingleQueryOptions,
} from '@/queries/v1/types'
export const getWorkflowListQueryOptions = <
  Mode extends IPaginationModes | undefined = undefined,
  IS_SUSPENSE extends boolean = true,
>(
  props: IListCallOptions<WorkFlowClientPartialEntity, IS_SUSPENSE, Mode> = {},
): IListCallOptions<WorkFlowClientPartialEntity, IS_SUSPENSE, Mode> => ({
  ...props,
  queryKey: ['workflow_list', ...(props.queryKey || [])],
})
export const getWorkflowQueryOptions = <IS_SUSPENSE extends boolean = false>(
  props: SingleQueryOptions<WorkFlowClientEntity, IS_SUSPENSE> = {},
): SingleQueryOptions<WorkFlowClientEntity, IS_SUSPENSE> => ({
  ...props,
  queryKey: [...(props.queryKey || [])],
})
