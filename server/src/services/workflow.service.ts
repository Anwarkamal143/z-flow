import { and, eq } from "@/db";
import { workflows } from "@/db/tables";
import { ErrorCode } from "@/enums/error-code.enum";
import { IUpdateUser } from "@/schema/user";
import {
  InsertWorkflows,
  InsertWorkflowsSchema,
  SelectWorkflows,
  UpdateWorkFlowNameSchema,
  WorkflowByIdUserIdSchema,
} from "@/schema/workflow";
import { formatZodError } from "@/utils";
import { BadRequestException, ValidationException } from "@/utils/catch-errors";
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
  async listAllPaginatedWorkflows(
    params: typeof this._types.PaginatedParams = {}
  ) {
    const { mode, sort = "desc", ...rest } = params;
    if (mode === "offset") {
      return await this.paginateOffset({
        ...rest,
        sort,
        where: rest.where,
      });
    }

    return await this.paginateCursor({
      ...rest,
      where: rest.where,
      sort,
      cursorColumn: params.cursorColumn
        ? params.cursorColumn
        : (table) => table.id,
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
    return await this.findOne((fields) => eq(fields.name, name));
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
    return await drizzleCache.query(
      async () => {
        return await this.findOne((fields) => eq(fields.id, id));
      },
      {
        options: {
          ttl: 600,
          useCache: usecahce,
          cacheKey: `workflows:${id}`,
        },
      }
    );
  }
  public async getByUserId(userId?: string) {
    if (!userId) {
      return {
        data: null,

        error: new BadRequestException("User Id is required", {
          errorCode: ErrorCode.VALIDATION_ERROR,
        }),
      };
    }

    return await this.findMany((fields) => eq(fields.userId, userId));
  }
  public async getByIdAndUserId(id?: string, userId?: string) {
    const parseResult = WorkflowByIdUserIdSchema.safeParse({
      id,
      userId,
    });
    if (!parseResult.success) {
      return {
        data: null,
        error: new ValidationException(
          "Invalid input",
          formatZodError(parseResult.error)
        ),
      };
    }
    const parseData = parseResult.data;
    return await this.findOne((fields) =>
      and(eq(fields.id, parseData.id), eq(fields.userId, parseData.userId))
    );
  }
  async softDeleteById(accountId: string) {
    return this.softDelete((table) => eq(table.id, accountId), {
      deleted_at: new Date(),
    });
  }

  public async deleteByIdUserId(id?: string, userId?: string) {
    const parseResult = WorkflowByIdUserIdSchema.safeParse({
      id,
      userId,
    });
    if (!parseResult.success) {
      return {
        data: null,

        error: new ValidationException(
          "Invalid input",
          formatZodError(parseResult.error)
        ),
      };
    }
    const data = parseResult.data;
    return await this.delete((fields) =>
      and(eq(fields.id, data.id), eq(fields.userId, data.userId))
    );
  }
  public async deleteUserWorkFlows(userId?: string) {
    if (!userId) {
      return {
        data: null,

        error: new BadRequestException("User Id is required", {
          errorCode: ErrorCode.VALIDATION_ERROR,
        }),
      };
    }
    return await this.delete((fields) => eq(fields.userId, userId));
  }

  public async createWorkflow(workflow: InsertWorkflows) {
    const parseResult = InsertWorkflowsSchema.safeParse(workflow);
    if (!parseResult.success) {
      return {
        data: null,
        error: new ValidationException(
          "Invalid input",
          formatZodError(parseResult.error)
        ),
      };
    }
    return await this.create(parseResult.data);
  }

  async updateWorkflowNameByIdAndUserId(
    name: string = "",
    id: string = "",
    userId?: string
  ) {
    const parseResult = UpdateWorkFlowNameSchema.safeParse({
      name,
      id,
      userId,
    });

    if (!parseResult.success) {
      return {
        data: null,

        error: new ValidationException(
          "Invalid input",
          formatZodError(parseResult.error)
        ),
      };
    }
    const {
      userId: uId,
      id: workflowId,
      name: workflowName,
    } = parseResult.data;
    const { data, ...rest } = await this.update<IUpdateUser>(
      (fields) => and(eq(fields.id, workflowId), eq(fields.userId, uId)),
      { name: workflowName }
    );
    await cacheManager.remove(`workflows`);
    return { ...rest, data: data?.[0] };
  }
}
export const workflowService = new WorkflowService();
