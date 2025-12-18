import { createCrudClient } from '@/queries/v1'
import { IAppUser } from '@/types/user'
import Model from './Model'

class HealthModel extends Model<IAppUser> {
  constructor() {
    super('/auth', 'public-1')
  }
  // async requestCredit() {
  //   const res = await request("/add-beta-credits", {
  //     method: "POST",
  //     data: {},
  //   });

  //   return res;
  // }
}

const healthModelInstance = new HealthModel()
export default healthModelInstance
export const healthClient = createCrudClient(healthModelInstance, {
  defaultParams: { limit: 50, entity: 'auth' },
})
