'use server'
import { optionsWithCookies } from '@/lib'
import { getCookieAsString } from '@/lib/auth/server-utils'

import { credentialClient, CredentialClientListOptions } from '@/models'
import {
  getCredentialListQueryOptions,
  getCredentialQueryOptions,
} from '../api/query-options'

export const prefetchServerCredentials = async (
  props: CredentialClientListOptions<'offset', false> = {},
  cookies: string | undefined = undefined,
) => {
  const cokies = cookies || (await getCookieAsString())
  const queryOptions = {
    ...getCredentialListQueryOptions<'offset', false>(),
    ...props,
  }
  credentialClient.prefetchList({
    ...queryOptions,
    options: optionsWithCookies(queryOptions.options, cokies),
  })
}
export const prefetchServerCredential = async (
  id: string,
  cookies: string | undefined = undefined,
) => {
  const cokies = cookies || (await getCookieAsString())

  const queryOptions = { ...getCredentialQueryOptions() }

  credentialClient.prefetchGet({
    ...queryOptions,
    id,
    options: optionsWithCookies(queryOptions.options, cokies),
  })
}
