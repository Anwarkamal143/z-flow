import { createCrudClient } from "@/queries/v1";
import { IAppUser } from "@/types/user";
import { Model } from ".";

class WorkflowModel extends Model<IAppUser> {
  constructor() {
    super("/workflow", "public-1");
  }
  // async requestCredit() {
  //   const res = await request("/add-beta-credits", {
  //     method: "POST",
  //     data: {},
  //   });

  //   return res;
  // }
}

const workflowModel = new WorkflowModel();
export default workflowModel;
export const workflowClient = createCrudClient(workflowModel, {
  defaultParams: { entity: "workflow" },
});
