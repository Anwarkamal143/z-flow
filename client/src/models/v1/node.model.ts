import { createCrudClient } from '@/queries/v1'
import { IListCallOptions, IPaginationModes } from '@/queries/v1/types'
import { INode } from '@/types/Inode'
import { Model } from '.'

class NodeModel extends Model<INode> {
  constructor() {
    super('/nodes', 'public-1')
  }
  // async requestCredit() {
  //   const res = await request("/add-beta-credits", {
  //     method: "POST",
  //     data: {},
  //   });

  //   return res;
  // }
}

const nodeModel = new NodeModel()
export default nodeModel
export const nodeClient = createCrudClient(nodeModel, {
  defaultParams: { entity: 'node' },
})
export type NodeClient = typeof nodeClient
export type NodeClientPartialEntity = typeof nodeClient.Entity
export type NodeClientEntity = typeof nodeClient.TEntity
export type NodeClientListOptions<
  Mode extends IPaginationModes | undefined = undefined,
  IsSuspense extends boolean = false,
> = IListCallOptions<typeof nodeClient.Entity, IsSuspense, Mode>
