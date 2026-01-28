'use client'
import { nodeClient, NodeClientEntity, NodeClientListOptions } from '@/models'
import { useSuspnseOffsetPagination } from '@/queries/pagination/hooks'
import { SingleQueryOptions } from '@/queries/v1/types'
import { getNodeListQueryOptions, getNodeQueryOptions } from './query-options'
export const nodeFilters = nodeClient.filters
export const nodeSorts = nodeClient.sorts
export const nodeSearch = nodeClient.search
export const useGetSuspenseNode = (
  opts: SingleQueryOptions<NodeClientEntity, true> = {},
) =>
  nodeClient.useSuspenseGet({
    ...opts,
    queryKey: getNodeQueryOptions({ ...opts }).queryKey,
  })

export const useSuspenseOffsetNodes = <
  T extends NodeClientListOptions<'offset', true> = NodeClientListOptions<
    'offset',
    true
  >,
>(
  props?: T,
) => {
  const mode = 'offset'
  return useSuspnseOffsetPagination(nodeClient, {
    ...getNodeListQueryOptions<'offset', true>({
      ...props,
      mode,

      params: {
        includeTotal: false,
        ...(props?.params || {}),
        mode,
      },
    }),
  })
}
export const useSuspenseNodesList = <
  T extends NodeClientListOptions<'offset', true> = NodeClientListOptions<
    'offset',
    true
  >,
>(
  props?: T,
) => {
  const mode = 'offset'
  return nodeClient.useList(
    getNodeListQueryOptions<'offset', true>({
      ...props,
      mode,

      params: {
        includeTotal: false,
        ...(props?.params || {}),
        mode,
      },
    }),
  )
}
