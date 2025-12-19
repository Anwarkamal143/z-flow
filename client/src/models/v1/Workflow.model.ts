import { createCrudClient } from '@/queries/v1'
import { IListCallOptions, IPaginationModes } from '@/queries/v1/types'
import { Model } from '.'

class WorkflowModel extends Model<IWorkflow> {
  constructor() {
    super('/workflows', 'public-1')
  }
  // async requestCredit() {
  //   const res = await request("/add-beta-credits", {
  //     method: "POST",
  //     data: {},
  //   });

  //   return res;
  // }
}

const workflowModel = new WorkflowModel()
export default workflowModel
export const workflowClient = createCrudClient(workflowModel, {
  defaultParams: { entity: 'workflow' },
})
export type WorkFlowClient = typeof workflowClient
export type WorkFlowClientPartialEntity = typeof workflowClient.Entity
export type WorkFlowClientEntity = typeof workflowClient.TEntity
export type WorkflowClientListOptions<
  Mode extends IPaginationModes | undefined = undefined,
  IsSuspense extends boolean = false,
> = IListCallOptions<typeof workflowClient.Entity, IsSuspense, Mode>
