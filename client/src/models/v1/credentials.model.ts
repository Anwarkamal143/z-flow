import { ICredential } from '@/features/credentials/schema/credential'
import { createCrudClient } from '@/queries/v1'
import { IListCallOptions, IPaginationModes } from '@/queries/v1/types'
import Model from './Model'

class CredentialModel extends Model<ICredential> {
  constructor() {
    super('/creds', 'public-1')
  }
  // async requestCredit() {
  //   const res = await request("/add-beta-credits", {
  //     method: "POST",
  //     data: {},
  //   });

  //   return res;
  // }
}

const credentialModelInstance = new CredentialModel()
export default credentialModelInstance
export const credentialClient = createCrudClient(credentialModelInstance, {
  defaultParams: { limit: 50, entity: 'credentials' },
})
export type CredentialClient = typeof credentialClient
export type CredentialClientPartialEntity = typeof credentialClient.Entity
export type CredentialClientEntity = typeof credentialClient.TEntity
export type CredentialClientListOptions<
  Mode extends IPaginationModes | undefined = undefined,
  IsSuspense extends boolean = false,
> = IListCallOptions<typeof credentialClient.Entity, IsSuspense, Mode>
