import { HTTPSTATUS } from "@/config/http.config";
import { and, eq } from "@/db";
import { workflows } from "@/db/tables";
import { ErrorCode } from "@/enums/error-code.enum";
import { IUpdateUser } from "@/schema/user";
import { InsertWorkflows, SelectWorkflows } from "@/schema/workflow";
import { stringToNumber } from "@/utils";
import { BadRequestException, NotFoundException } from "@/utils/catch-errors";
import { cacheManager } from "@/utils/redis-cache/cache-manager";
import drizzleCache from "@/utils/redis-cache/drizzle-cache";
import { BaseService } from "./base.service";

export class WorkflowService extends BaseService<
  typeof workflows,
  InsertWorkflows,
  SelectWorkflows
> {
  constructor() {
    super(workflows);
  }
  async listAllPaginatedWorkflows(params: typeof this._types.PaginatedParams) {
    const { mode, limit, sort = "desc", ...rest } = params;
    const limitNumber = stringToNumber(limit || "50") as number;
    if (mode === "offset") {
      const { page } = params;
      const pageNumber = stringToNumber(page || "0") as number;
      const res = await this.paginateOffset({
        ...rest,
        limit: limitNumber,
        page: pageNumber,
        sort,
        where: rest.where,
      });
      return res;
    }
    const { cursor } = params;

    const resp = await this.paginateCursor({
      ...rest,
      where: rest.where,
      cursor,
      limit: limitNumber,
      sort,
      cursorColumn: params.cursorColumn
        ? params.cursorColumn
        : (table) => table.id,
    });
    return resp;
  }
  async softDeleteById(accountId: string) {
    return this.softDelete((table) => eq(table.id, accountId), {
      deleted_at: new Date(),
    });
  }

  public async getByName(name: string) {
    if (!name) {
      return {
        data: null,
        error: new BadRequestException("name is required", {
          errorCode: ErrorCode.VALIDATION_ERROR,
        }),
      };
    }
    const { data: workflow } = await this.findOne((fields) =>
      eq(fields.name, name)
    );
    if (!workflow) {
      return {
        data: null,
        error: new NotFoundException("Workflow not found"),
      };
    }
    return {
      data: workflow,
      status: HTTPSTATUS.OK,
    };
  }

  public async getById(id?: string, usecahce = false) {
    if (!id) {
      return {
        data: null,

        error: new BadRequestException("Workflow Id is required", {
          errorCode: ErrorCode.VALIDATION_ERROR,
        }),
      };
    }
    const workflow = await drizzleCache.query(
      async () => {
        const { data } = await this.findOne((fields) => eq(fields.id, id));

        return data;
      },
      {
        options: {
          ttl: 600,
          useCache: usecahce,
          cacheKey: `workflows:${id}`,
        },
      }
    );

    // const { data: user } = await this.findOne((fields) => eq(fields.id, id));
    if (!workflow) {
      return {
        data: null,
        error: new NotFoundException("Workflow not found"),
      };
    }

    return { data: workflow };
  }

  public async deleteById(id?: string) {
    if (!id) {
      return {
        data: null,

        error: new BadRequestException("Workflow Id is required", {
          errorCode: ErrorCode.VALIDATION_ERROR,
        }),
      };
    }
    const deletedWorkflow = await this.delete((fields) => eq(fields.id, id));

    // const { data: user } = await this.findOne((fields) => eq(fields.id, id));
    if (!deletedWorkflow.data) {
      return {
        data: null,
        error: new NotFoundException("Workflow not found"),
      };
    }

    return { data: deletedWorkflow.data };
  }
  public async getByIdAndUserId(id?: string, userId?: string) {
    if (!id) {
      return {
        data: null,

        error: new BadRequestException("Workflow Id is required", {
          errorCode: ErrorCode.VALIDATION_ERROR,
        }),
      };
    }
    if (!userId) {
      return {
        data: null,

        error: new BadRequestException("User Id is required", {
          errorCode: ErrorCode.VALIDATION_ERROR,
        }),
      };
    }
    const { data } = await this.findOne((fields) =>
      and(eq(fields.id, id), eq(fields.userId, userId))
    );

    if (!data) {
      return {
        data: null,
        error: new NotFoundException("Workflow not found"),
      };
    }

    return { data, error: null };
  }

  public async createWorkflow(worflow: InsertWorkflows) {
    const { data } = await this.create([worflow]);
    if (!data) {
      return {
        data: null,
        error: new BadRequestException("Workflow not created", {
          errorCode: ErrorCode.BAD_REQUEST,
        }),
      };
    }
    return {
      data,
      status: HTTPSTATUS.CREATED,
    };
  }

  async updateWorkflowName(name: string, id: string) {
    const { data, ...rest } = await this.update<IUpdateUser>(
      (fields) => eq(fields.id, id),
      [{ name }]
    );
    await cacheManager.remove(`workflows`);
    return { ...rest, data };
  }
  async updateWorkflowNameByIdAndUserId(
    name: string,
    id: string,
    userId: string
  ) {
    if (!id) {
      return {
        data: null,

        error: new BadRequestException("Workflow Id is required", {
          errorCode: ErrorCode.VALIDATION_ERROR,
        }),
      };
    }
    if (!userId) {
      return {
        data: null,

        error: new BadRequestException("User Id is required", {
          errorCode: ErrorCode.VALIDATION_ERROR,
        }),
      };
    }
    if (!name) {
      return {
        data: null,

        error: new BadRequestException("Workflow name is required", {
          errorCode: ErrorCode.VALIDATION_ERROR,
        }),
      };
    }

    const { data, ...rest } = await this.update<IUpdateUser>(
      (fields) => and(eq(fields.id, id), eq(fields.userId, userId)),
      [{ name }]
    );
    await cacheManager.remove(`workflows`);
    return { ...rest, data };
  }
}
export const workflowService = new WorkflowService();
