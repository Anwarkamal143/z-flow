import { eq } from "@/db";

import { HTTPSTATUS } from "@/config/http.config";
import { nodes } from "@/db/tables";
import {
  INode,
  InsertManyNodesSchema,
  InsertNode,
  InsertNodeSchema,
} from "@/schema/node";
import { formatZodError } from "@/utils";
import { ValidationException } from "@/utils/catch-errors";
import { BaseService, ITransaction } from "./base.service";

export class NodeService extends BaseService<typeof nodes, InsertNode, INode> {
  constructor() {
    super(nodes);
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
  public async deleteByWorkflowId(WorkflowId: string, tsx?: ITransaction) {
    if (!WorkflowId) {
      return {
        data: null,
        error: new ValidationException("Invalid input", [
          { path: "workflowId", message: "WorkflowId is required" },
        ]),
      };
    }
    return await this.delete(
      (fields) => eq(fields.workflowId, WorkflowId),
      tsx
    );
  }
  async createItem(data: InsertNode, tsx?: ITransaction) {
    const result = InsertNodeSchema.safeParse(data);
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
  async createItems(data: InsertNode[], tsx?: ITransaction) {
    const result = InsertManyNodesSchema.safeParse(data);
    if (!result.success) {
      const errors = formatZodError(result.error);

      return {
        error: new ValidationException("Validatoin error", errors),
        data: null,
        status: HTTPSTATUS.BAD_REQUEST,
      };
    }
    return await this.createMany(result.data, tsx);
  }
}
export const nodeService = new NodeService();
