import { HTTPSTATUS } from "@/config/http.config";
import { AccountType, and, eq, IProviderType, Provider } from "@/db";

import { accounts } from "@/db/tables";
import { InsertAccount, SelectAccount } from "@/schema/account";
import { stringToNumber } from "@/utils";
import {
  InternalServerException,
  NotFoundException,
} from "@/utils/catch-errors";
import { BaseService, IPaginatedParams } from "./base.service";

export class AccountService extends BaseService<
  typeof accounts,
  InsertAccount,
  SelectAccount
> {
  constructor() {
    super(accounts);
  }

  async upsertGithubAccount(userId: string, githubId: string) {
    return this.upsert(
      [
        {
          userId: userId,
          provider: "github",
          provider_account_id: githubId,
          type: AccountType.oauth,
        },
      ],
      [accounts.userId, accounts.provider],
      { updated_at: new Date() }
    );
  }

  async listPaginatedAccounts(params: IPaginatedParams) {
    const { mode, limit, sort = "desc" } = params;
    const limitNumber = stringToNumber(limit || "50") as number;
    if (mode === "offset") {
      const { page } = params;
      const pageNumber = stringToNumber(page || "0") as number;
      return await this.paginateOffset({
        limit: limitNumber,
        page: pageNumber,
        sort,
      });
    }
    const { cursor } = params;

    return await this.paginateCursor({
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

  public async createAccount(userId: string) {
    try {
      const {
        data: account,
        error,
        status,
      } = await this.create([
        {
          userId: userId,
          type: AccountType.email,
          provider: Provider.email,
        },
      ]);

      if (!account) {
        return {
          error,
        };
      }
      return {
        data: account,
        status,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }

  public async createAccountViaGithub(userId: string, githubId: string) {
    try {
      const {
        data: account,
        error,
        status,
      } = await this.create([
        {
          userId: userId,
          provider: Provider.github,
          provider_account_id: githubId,
          type: AccountType.oauth,
        },
      ]);

      if (!account) {
        return {
          error,
        };
      }
      return {
        data: account,
        status,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }
  public async createAccountViaGoogle(userId: string, googleId: string) {
    try {
      const {
        data: account,
        error,
        status,
      } = await this.create([
        {
          userId: userId,
          provider: Provider.google,
          provider_account_id: googleId,
          type: AccountType.oauth,
        },
      ]);

      if (!account) {
        return {
          error,
        };
      }
      return {
        data: account,
        status,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }
  public async getAccountByUserId(userId: string) {
    try {
      const { data: account } = await this.findOne((table) =>
        eq(table.userId, userId)
      );
      if (!account) {
        return {
          data: null,
          error: new NotFoundException("Account not found"),
        };
      }
      return {
        data: account,
        status: HTTPSTATUS.OK,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }
  public async getAccountByProviderId(
    providerId: string,
    providerType: IProviderType
  ) {
    try {
      const { data } = await this.findOne((table) =>
        and(
          eq(table.provider_account_id, providerId),
          eq(table.provider, providerType)
        )
      );
      if (!data?.id) {
        return {
          data: null,
          error: new NotFoundException("Account not found"),
        };
      }
      return {
        data,
        error: null,
        status: HTTPSTATUS.OK,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }
}
export const accountService = new AccountService();
