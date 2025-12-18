import { createCrudClient } from '@/queries/v1'
import { CrudHookOptionsTypes } from '../types'
import { PolarModel } from './Polar.model'

class CustomerModel extends PolarModel<CustomerState> {
  constructor() {
    super('customer')
  }
}

const customerModelInstance = new CustomerModel()
export default customerModelInstance
export const customerClient = createCrudClient(customerModelInstance, {
  defaultParams: { limit: 50, entity: 'customer' },
})

export type ICustomerHooksTypes = CrudHookOptionsTypes<typeof customerClient>
