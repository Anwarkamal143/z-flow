import { createCrudClient } from '@/queries/v1'
import { CrudHookOptionsTypes } from '../types'
import { PolarModel } from './Polar.model'
class PortalModel extends PolarModel<any> {
  constructor() {
    super('portal')
  }
}

const portalModelInstance = new PortalModel()
export default portalModelInstance
export const portalClient = createCrudClient(portalModelInstance, {
  defaultParams: { limit: 50, entity: 'portal' },
})

export type IPortalHooksOptions = CrudHookOptionsTypes<typeof portalClient>
