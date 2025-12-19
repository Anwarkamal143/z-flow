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
): IListCallOptions<any, IS_SUSPENSE, Mode> => ({
  queryKey: ['workflow_list'],
  ...props,
})
export const getWorkflowQueryOptions = <IS_SUSPENSE extends boolean = false>(
  props: SingleQueryOptions<WorkFlowClientEntity, object, IS_SUSPENSE> = {},
): SingleQueryOptions<WorkFlowClientEntity, object, IS_SUSPENSE> => ({
  queryKey: ['workflow_item'],
  ...props,
})
