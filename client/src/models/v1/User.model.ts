import { createCrudClient } from '@/queries/v1'
import { IAppUser } from '@/types/user'
import { Model } from '.'
import { CrudHookOptionsTypes, ListOptions } from './types'

class UserModel extends Model<IAppUser> {
  constructor() {
    super('/user', 'public-1')
  }
  // async requestCredit() {
  //   const res = await request("/add-beta-credits", {
  //     method: "POST",
  //     data: {},
  //   });

  //   return res;
  // }
}

const userModel = new UserModel()
export default userModel
export const userClient = createCrudClient(userModel, {
  defaultParams: { entity: 'user' },
})
export type IUserHooksTypes = CrudHookOptionsTypes<typeof userClient>
export type IUserHooksOptionsTypes = ListOptions<typeof userClient>
