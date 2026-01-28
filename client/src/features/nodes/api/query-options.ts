import { NodeClientEntity, NodeClientPartialEntity } from '@/models'
import {
  IListCallOptions,
  IPaginationModes,
  SingleQueryOptions,
} from '@/queries/v1/types'
export const getNodeListQueryOptions = <
  Mode extends IPaginationModes | undefined = undefined,
  IS_SUSPENSE extends boolean = true,
>(
  props: IListCallOptions<NodeClientPartialEntity, IS_SUSPENSE, Mode> = {},
): IListCallOptions<NodeClientPartialEntity, IS_SUSPENSE, Mode> => ({
  ...props,
  queryKey: ['node_list', ...(props.queryKey || [])],
})
export const getNodeQueryOptions = <IS_SUSPENSE extends boolean = false>(
  props: SingleQueryOptions<NodeClientEntity, IS_SUSPENSE> = {},
): SingleQueryOptions<NodeClientEntity, IS_SUSPENSE> => ({
  ...props,
  queryKey: [...(props.queryKey || [])],
})
