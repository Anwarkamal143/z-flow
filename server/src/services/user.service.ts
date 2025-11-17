import { HTTPSTATUS } from "@/config/http.config";
import { db, eq, Provider, Role } from "@/db";
import { users } from "@/db/tables";
import { ErrorCode } from "@/enums/error-code.enum";
import { InsertUser, SelectUser } from "@/schema/user";
import { stringToNumber } from "@/utils";
import {
  BadRequestException,
  InternalServerException,
  NotFoundException,
} from "@/utils/catch-errors";
import { toUTC } from "@/utils/date-time";
import { AccountService } from "./accounts.service";
import { BaseService, IPaginatedParams } from "./base.service";
import { cache } from "./redis.service";
type CreateUserInput = Pick<SelectUser, "email" | "name"> &
  Partial<Omit<SelectUser, "email" | "name">>;

export class UserService extends BaseService<
  typeof users,
  InsertUser,
  SelectUser
> {
  constructor(private accountService = new AccountService()) {
    super(users);
  }

  async listAllPaginatedUsers(params: IPaginatedParams) {
    const { mode, limit, sort = "desc" } = params;
    const limitNumber = stringToNumber(limit || "50") as number;
    if (mode === "offset") {
      const { page } = params;
      const pageNumber = stringToNumber(page || "0") as number;
      const res = await this.paginateOffset({
        limit: limitNumber,
        page: pageNumber,
        order: sort,
      });
      if (res.data) {
        res.data = res.data.map((r) => ({ ...r, password: undefined }));
      }
      return res;
    }
    const { cursor } = params;

    const resp = await this.paginateCursor({
      cursor,
      limit: limitNumber,
      order: sort,
      cursorColumn: (table) => table.id,
    });
    if (resp.data) {
      resp.data = resp.data.map((r) => ({ ...r, password: undefined }));
    }
    return resp;
  }
  async softDeleteUserById(accountId: string) {
    return this.softDelete((table) => eq(table.id, accountId), {
      deleted_at: new Date(),
    });
  }

  public async getUserByEmail(email: string) {
    try {
      if (!email) {
        return {
          data: null,
          error: new BadRequestException("Email is required", {
            errorCode: ErrorCode.VALIDATION_ERROR,
          }),
        };
      }
      const { data: user } = await this.findOne((fields) =>
        eq(fields.email, email)
      );
      if (!user) {
        return {
          data: null,
          error: new NotFoundException("User not found"),
        };
      }
      return { data: { ...user, password: undefined }, status: HTTPSTATUS.OK };
    } catch (e: any) {
      console.error("[UserService:getUserById]", e?.message || e);
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }

  public async getUserById(
    id?: string,
    usecahce = false,
    excludePassword = true
  ) {
    try {
      if (!id) {
        return {
          data: null,

          error: new BadRequestException("User Id is required", {
            errorCode: ErrorCode.VALIDATION_ERROR,
          }),
        };
      }
      const { data: user } = await cache(
        `user:${id}`,
        async () => {
          const { data, ...rest } = await this.findOne((fields) =>
            eq(fields.id, id)
          );
          if (data && excludePassword) {
            return { ...rest, data: { ...data, password: undefined } };
          }
          return { ...rest, data };
        },
        { ttl: 600, useCache: usecahce }
      );
      // const { data: user } = await this.findOne((fields) => eq(fields.id, id));
      if (!user) {
        return {
          data: null,
          error: new NotFoundException("User not found"),
        };
      }
      if (excludePassword) {
        user.password = undefined;
      }
      return { data: user };
    } catch (e) {
      console.log("getUserById Error", e);
      return {
        data: null,

        error: new InternalServerException(),
      };
    }
  }
  public async createUser(data: CreateUserInput) {
    try {
      const [user] = await db
        .insert(users)
        .values({
          ...data,
        })
        .returning();
      if (!user) {
        return {
          data: null,
          error: new BadRequestException("User not created", {
            errorCode: ErrorCode.BAD_REQUEST,
          }),
        };
      }
      return {
        data: { ...user, password: undefined },
        status: HTTPSTATUS.CREATED,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }

  async createGoogleUserUseCase(googleUser: IGoogleUser) {
    try {
      let existingUser = await this.getUserByEmail(googleUser.email);
      let user = existingUser.data;
      if (!user) {
        const { data } = await this.createUser({
          email: googleUser.email,
          email_verified: toUTC(new Date(), false),
          name: googleUser.name?.toLowerCase(),
          image: googleUser.picture,
          role: Role.SUPER_ADMIN,
        });
        user = data;
      }
      // const user = existingUser.user;
      if (!user) {
        return {
          data: null,
          error: new BadRequestException("Failed to create Google user", {
            errorCode: ErrorCode.BAD_REQUEST,
          }),
        };
      }

      await this.accountService.createAccountViaGoogle(user.id, googleUser.sub);

      return { data: user, status: HTTPSTATUS.CREATED };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException("Failed to create Google user"),
      };
    }
  }

  async getAccountByGoogleIdUseCase(googleId: string) {
    return await this.accountService.getAccountByProviderId(
      googleId,
      Provider.google
    );
  }
}
export const userService = new UserService();
