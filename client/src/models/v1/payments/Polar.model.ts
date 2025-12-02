import { createCrudClient } from "@/queries/v1";
import Model from "../Model";

export class PolarModel<T> extends Model<T> {
  constructor(endpoint?: string) {
    super(`/payments${endpoint ? `/${endpoint}` : ""}`, "public-1");
  }
  // async requestCredit() {
  //   const res = await request("/add-beta-credits", {
  //     method: "POST",
  //     data: {},
  //   });

  //   return res;
  // }
}

const polarModelInstance = new PolarModel();
export default polarModelInstance;
export const polarClient = createCrudClient(polarModelInstance, {
  defaultParams: { limit: 50, entity: "payments" },
});
