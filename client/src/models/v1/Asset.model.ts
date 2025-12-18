import { createCrudClient } from '@/queries/v1'
import { IAsset } from '@/types/Iupload'
import { Model } from '.'

class AssetModel extends Model<IAsset> {
  constructor() {
    super('/assets', 'public-1')
  }
  // async requestCredit() {
  //   const res = await request("/add-beta-credits", {
  //     method: "POST",
  //     data: {},
  //   });

  //   return res;
  // }
}

const assetInstance = new AssetModel()
export default assetInstance
export const assetClient = createCrudClient(assetInstance, {
  defaultParams: { limit: 50, entity: 'asset' },
})
