import { CredentialClientEntity, CredentialClientPartialEntity } from '@/models'
import {
  IListCallOptions,
  IPaginationModes,
  SingleQueryOptions,
} from '@/queries/v1/types'
export const getCredentialListQueryOptions = <
  Mode extends IPaginationModes | undefined = undefined,
  IS_SUSPENSE extends boolean = true,
>(
  props: IListCallOptions<
    CredentialClientPartialEntity,
    IS_SUSPENSE,
    Mode
  > = {},
): IListCallOptions<CredentialClientPartialEntity, IS_SUSPENSE, Mode> => ({
  ...props,
  queryKey: ['credential_list', ...(props.queryKey || [])],
})
export const getCredentialQueryOptions = <IS_SUSPENSE extends boolean = false>(
  props: SingleQueryOptions<CredentialClientEntity, IS_SUSPENSE> = {},
): SingleQueryOptions<CredentialClientEntity, IS_SUSPENSE> => ({
  ...props,
  queryKey: [...(props.queryKey || [])],
})
