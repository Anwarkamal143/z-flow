import { createCrudClient } from '@/queries/v1'
import { Checkout } from '@polar-sh/sdk/models/components/checkout'
import { PolarModel } from './Polar.model'
class CheckoutModel extends PolarModel<Checkout> {
  constructor() {
    super('checkout')
  }
}

const checkoutModelInstance = new CheckoutModel()
export default checkoutModelInstance
export const checkoutClient = createCrudClient(checkoutModelInstance, {
  defaultParams: { limit: 50, entity: 'checkout' },
})
