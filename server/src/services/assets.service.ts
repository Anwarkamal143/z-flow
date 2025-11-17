import { eq } from "@/db";

import { HTTPSTATUS } from "@/config/http.config";
import { assets } from "@/db/tables";
import { ErrorCode } from "@/enums/error-code.enum";
import { IAsset, InsertAsset, InsertAssetSchema } from "@/schema/asset";
import { formatZodError, stringToNumber } from "@/utils";
import {
  BadRequestException,
  InternalServerException,
  NotFoundException,
  ValidationException,
} from "@/utils/catch-errors";
import { BaseService, IPaginatedParams } from "./base.service";
import { cache } from "./redis.service";

export class AseetService extends BaseService<
  typeof assets,
  InsertAsset,
  IAsset
> {
  constructor() {
    super(assets);
  }

  async listPaginatedAseets(params: IPaginatedParams) {
    const { mode, limit, sort = "desc" } = params;
    const limitNumber = stringToNumber(limit || "50") as number;
    if (mode === "offset") {
      const { page } = params;
      const pageNumber = stringToNumber(page || "0") as number;
      return await this.paginateOffset({
        limit: limitNumber,
        page: pageNumber,
        order: sort,
      });
    }
    const { cursor } = params;

    return await this.paginateCursor({
      cursor,
      limit: limitNumber,
      order: sort,
      cursorColumn: (table) => table.id,
    });
  }

  async softDeleteAccountById(accountId: string) {
    return this.softDelete((table) => eq(table.id, accountId), {
      deleted_at: new Date(),
    });
  }
  public async getAssetById(id: string, usecahce = false) {
    try {
      if (!id) {
        return {
          data: null,

          error: new BadRequestException("Asset Id is required", {
            errorCode: ErrorCode.VALIDATION_ERROR,
          }),
        };
      }
      const { data: user } = await cache(
        `asset:${id}`,
        async () => await this.findOne((fields) => eq(fields.id, id)),
        { ttl: 600, useCache: usecahce }
      );
      // const { data: user } = await this.findOne((fields) => eq(fields.id, id));
      if (!user) {
        return {
          data: null,
          error: new NotFoundException("Asset not found"),
        };
      }

      return { data: user };
    } catch (e) {
      console.log("getAssetById Error", e);
      return {
        data: null,

        error: new InternalServerException(),
      };
    }
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

    return this.create(data);
  }
}
export const assetsService = new AseetService();
