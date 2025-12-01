import { eq, UserAddressType } from "@/db";

import { HTTPSTATUS } from "@/config/http.config";
import { userAddresses } from "@/db/tables";
import { ErrorCode } from "@/enums/error-code.enum";
import { InsertAddress, SelectAddress } from "@/schema/address";
import { stringToNumber } from "@/utils";
import {
  BadRequestException,
  InternalServerException,
  NotFoundException,
} from "@/utils/catch-errors";
import { BaseService, IPaginatedParams } from "./base.service";

export class AddressService extends BaseService<
  typeof userAddresses,
  InsertAddress,
  SelectAddress
> {
  constructor() {
    super(userAddresses);
  }

  async upsertUserAddress(address: InsertAddress, userId: string) {
    if (!userId) {
      return {
        error: new BadRequestException(
          "User ID is required to Add Or Update address"
        ),
        data: null,
      };
    }
    return this.upsert(
      {
        ...address,
        type: UserAddressType.BILLING,
      },
      [userAddresses.userId],
      { updated_at: new Date(), ...address }
    );
  }

  async listPaginatedAddresses(params: IPaginatedParams) {
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

  async softDeleteAddressById(accountId: string) {
    return this.softDelete((table) => eq(table.id, accountId), {
      deleted_at: new Date(),
    });
  }

  public async createAddress(address: InsertAddress, userId: string) {
    try {
      if (!userId) {
        return {
          error: new BadRequestException(
            "User ID is required to create an address."
          ),
          data: null,
        };
      }
      const { data, error, status } = await this.create({
        ...address,
        userId,
      });

      return {
        data,
        status,
        error,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException("Address creation failed."),
      };
    }
  }

  public async getAddressByUserId(userId: string) {
    try {
      if (!userId) {
        return {
          data: null,
          error: new BadRequestException(
            "User ID is required for the address",
            {
              errorCode: ErrorCode.VALIDATION_ERROR,
            }
          ),
        };
      }
      const { data } = await this.findOne((fields) =>
        eq(fields.userId, userId)
      );
      if (!data) {
        return {
          data: null,
          error: new NotFoundException("Address not found"),
        };
      }
      return {
        data,
        status: HTTPSTATUS.OK,
      };
    } catch (e: any) {
      console.error("[AddressService:getAddressById]", e?.message || e);
      return {
        data: null,
        error: new InternalServerException("Failed to retrieve address"),
      };
    }
  }
}
export const addressService = new AddressService();
