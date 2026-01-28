import { eq, inArray } from "@/db";

import { BaseService, ITransaction } from "./base.service";

import { nodeCredentials } from "@/db/tables";
import {
  InsertManyNodeCredentialsSchema,
  InsertNodeCredential,
  InsertNodeCredentialSchema,
} from "@/schema/node-credentials";
import { formatZodError } from "@/utils";
import {
  BadRequestException,
  NotFoundException,
  ValidationException,
} from "@/utils/catch-errors";

export type NodeCredentialPaginationConfig =
  typeof nodeCredentialService._types.PaginationsConfig;
export type NodeCredentialSimplePaginationConfig =
  typeof nodeCredentialService._types.PaginatedParams;

export class NodeCredentialService extends BaseService<typeof nodeCredentials> {
  constructor() {
    super(nodeCredentials);
  }
  checkIfNeedToUpdate(
    newValue: Record<string, any>,
    existingValue: Record<string, any>,
  ) {
    const keys = Object.keys(newValue);
    for (const key of keys) {
      if (newValue[key] != existingValue[key]) {
        return true;
      }
    }
    return false;
  }

  async getByCredentialId(id: string, userId: string) {
    if (!id) {
      return {
        error: new ValidationException("id is required", [
          { path: "id", message: "id is required" },
        ]),
        data: null,
      };
    }
    if (!userId) {
      return {
        error: new ValidationException("userId is required", [
          { path: "userId", message: "userId is required" },
        ]),
        data: null,
      };
    }
    const res = await this.findOne((t) => eq(t.credentialId, id));

    if (!res.data)
      return {
        error: new NotFoundException("credential not found"),
        data: null,
      };

    return {
      data: res.data,
      error: null,
    };
  }
  async getByNodeId(id: string, userId: string) {
    if (!id) {
      return {
        error: new ValidationException("id is required", [
          { path: "id", message: "id is required" },
        ]),
        data: null,
      };
    }
    if (!userId) {
      return {
        error: new ValidationException("userId is required", [
          { path: "userId", message: "userId is required" },
        ]),
        data: null,
      };
    }
    const res = await this.findOne((t) => eq(t.nodeId, id));

    if (!res.data)
      return {
        error: new NotFoundException("node not found"),
        data: null,
      };

    return {
      data: res.data,
      error: null,
    };
  }
  async resolveByCredentialIds(ids?: string[]) {
    if (!ids || !ids.length) {
      return {
        error: new ValidationException("NodeIds are required", [
          { path: "nodeIds", message: "nodeId is required" },
        ]),
        data: null,
      };
    }
    const res = await this.findMany((t) => inArray(t.credentialId, ids));

    if (!res.data)
      return { error: new NotFoundException("secret not found"), data: null };

    const data = res.data;
    if (!data || !data.length) {
      return {
        data: null,
        error: new BadRequestException("not a valid credential"),
      };
    }
    return {
      data,
      error: null,
    };
  }

  /********************* CRUD  */
  /* ---------------- Create Secret ---------------- */

  async createNodeCredential(input: InsertNodeCredential, tx?: ITransaction) {
    const parseResult = InsertNodeCredentialSchema.safeParse(input);
    if (!parseResult.success) {
      return {
        error: new ValidationException(
          "Invalid input data",
          formatZodError(parseResult.error),
        ),
        data: null,
      };
    }

    return this.create(parseResult.data, tx);
  }
  async createManyNodeCredential(
    input: InsertNodeCredential[],
    tx?: ITransaction,
  ) {
    const parseResult = InsertManyNodeCredentialsSchema.safeParse(input);
    if (!parseResult.success) {
      return {
        error: new ValidationException(
          "Invalid input data",
          formatZodError(parseResult.error),
        ),
        data: null,
      };
    }

    return await this.createMany(parseResult.data, tx);
  }

  async listAllPaginatedCredentials(params: NodeCredentialPaginationConfig) {
    const { mode } = params;
    if (mode == "offset") {
      const listresp = await this.paginationOffsetRecords({
        ...params,
      });

      return listresp;
    }
    const listresp = await this.paginationCursorRecords(params);

    return listresp;
  }
}

export const nodeCredentialService = new NodeCredentialService();
