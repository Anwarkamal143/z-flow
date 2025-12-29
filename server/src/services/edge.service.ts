import { eq } from "@/db";

import { HTTPSTATUS } from "@/config/http.config";
import { connections } from "@/db/tables";
import {
  IEdge,
  InsertEdge,
  InsertEdgeSchema,
  InsertManyEdgeSchema,
} from "@/schema/edges";
import { formatZodError } from "@/utils";
import { ValidationException } from "@/utils/catch-errors";
import { BaseService, ITransaction } from "./base.service";

export class EdgeService extends BaseService<
  typeof connections,
  InsertEdge,
  IEdge
> {
  constructor() {
    super(connections);
  }

  async listPaginatedItems(params: typeof this._types.PaginatedParams) {
    const { mode, sort = "desc", ...rest } = params;
    if (mode === "offset") {
      return await this.paginateOffset({
        ...rest,
        sort,
      });
    }

    return await this.paginateCursor({
      ...rest,
      sort,
      cursorColumn: (table) => table.id,
    });
  }

  async softDeleteAccountById(accountId: string) {
    return this.softDelete((table) => eq(table.id, accountId), {
      deleted_at: new Date(),
    });
  }

  async createItem(data: InsertEdge, tsx?: ITransaction) {
    const result = InsertEdgeSchema.safeParse(data);
    if (result.error) {
      const errors = formatZodError(result.error);

      return {
        error: new ValidationException("Validatoin error", errors),
        data: null,
        status: HTTPSTATUS.BAD_REQUEST,
      };
    }
    return await this.create(result.data, tsx);
  }
  async createItems(data: InsertEdge[], tsx?: ITransaction) {
    const result = InsertManyEdgeSchema.safeParse(data);
    if (result.error) {
      const errors = formatZodError(result.error);

      return {
        error: new ValidationException("Validatoin error", errors),
        data: null,
        status: HTTPSTATUS.BAD_REQUEST,
      };
    }
    console.log(result.data, "result");

    return await this.createMany(result.data, tsx);
  }
}
export const edgeService = new EdgeService();
