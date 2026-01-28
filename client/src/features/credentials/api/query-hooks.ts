'use client'
import {
  credentialClient,
  CredentialClientEntity,
  CredentialClientListOptions,
} from '@/models'
import { useSuspnseOffsetPagination } from '@/queries/pagination/hooks'
import { SingleQueryOptions } from '@/queries/v1/types'
import {
  getCredentialListQueryOptions,
  getCredentialQueryOptions,
} from './query-options'
export const credentialFilters = credentialClient.filters
export const credentialSorts = credentialClient.sorts
export const credentialSearch = credentialClient.search
export const useGetSuspenseCredential = (
  opts: SingleQueryOptions<CredentialClientEntity, true> = {},
) =>
  credentialClient.useSuspenseGet({
    ...opts,
    queryKey: getCredentialQueryOptions({ ...opts }).queryKey,
  })

export const useSuspenseOffsetCredentials = <
  T extends CredentialClientListOptions<'offset', true> =
    CredentialClientListOptions<'offset', true>,
>(
  props?: T,
) => {
  const mode = 'offset'
  return useSuspnseOffsetPagination(credentialClient, {
    ...getCredentialListQueryOptions<'offset', true>({
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
export const useSuspenseCredentialsList = <
  T extends CredentialClientListOptions<'offset', true> =
    CredentialClientListOptions<'offset', true>,
>(
  props?: T,
) => {
  const mode = 'offset'
  return credentialClient.useList(
    getCredentialListQueryOptions<'offset', true>({
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
