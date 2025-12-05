import { eq } from "@/db";

import { HTTPSTATUS } from "@/config/http.config";
import { assets } from "@/db/tables";
import { IAsset, InsertAsset, InsertAssetSchema } from "@/schema/asset";
import { formatZodError, stringToNumber } from "@/utils";
import { ValidationException } from "@/utils/catch-errors";
import { BaseService } from "./base.service";

export class AseetService extends BaseService<
  typeof assets,
  InsertAsset,
  IAsset
> {
  constructor() {
    super(assets);
  }

  async listPaginatedAseets(params: typeof this._types.PaginatedParams) {
    const { mode, limit, sort = "desc", ...rest } = params;
    const limitNumber = stringToNumber(limit || "50") as number;
    if (mode === "offset") {
      const { page } = params;
      const pageNumber = stringToNumber(page || "0") as number;
      return await this.paginateOffset({
        ...rest,
        limit: limitNumber,
        page: pageNumber,
        sort,
      });
    }
    const { cursor } = params;

    return await this.paginateCursor({
      ...rest,
      cursor,
      limit: limitNumber,
      sort,
      cursorColumn: (table) => table.id,
    });
  }

  async softDeleteAccountById(accountId: string) {
    return this.softDelete((table) => eq(table.id, accountId), {
      deleted_at: new Date(),
    });
  }

  async createAsset(data: InsertAsset) {
    const result = InsertAssetSchema.safeParse(data);
    if (result.error) {
      const errors = formatZodError(result.error);
      errors.forEach((e) => {
        console.log("erro", e.message + " : " + e.path);
      });
      return {
        error: new ValidationException("Validatoin error", errors),
        data: null,
        status: HTTPSTATUS.BAD_REQUEST,
      };
    }

    return await this.create([data]);
  }
}
export const assetsService = new AseetService();
