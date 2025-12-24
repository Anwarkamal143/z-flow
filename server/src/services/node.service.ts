import { eq } from "@/db";

import { HTTPSTATUS } from "@/config/http.config";
import { nodes } from "@/db/tables";
import { ErrorCode } from "@/enums/error-code.enum";
import { INode, InsertNode, InsertNodeSchema } from "@/schema/node";
import { formatZodError } from "@/utils";
import { BadRequestException, ValidationException } from "@/utils/catch-errors";
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
    console.log(result.data, "result data");
    try {
      return tsx
        ? await this.create(result.data, tsx)
        : await this.withTransaction(async (tx) => {
            const nodeItem = await this.create(result.data, tx);
            if (nodeItem.error) {
              throw new BadRequestException("Failed to create node", {
                errorCode: ErrorCode.DATABASE_ERROR,
              });
            }
            return nodeItem;
          });
    } catch (error) {
      return {
        error,
        data: null,
        status: HTTPSTATUS.BAD_REQUEST,
      };
    }
  }
}
export const nodeService = new NodeService();
