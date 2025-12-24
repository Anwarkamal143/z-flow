import { and, eq, inArray, NodeType } from "@/db";
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
import { UUID } from "ulid";
import { BaseService } from "./base.service";
import { nodeService } from "./node.service";
export type WorkflowPaginationConfig =
  typeof workflowService._types.PaginationsConfig;
export type WorkflowSimplePaginationConfig =
  typeof workflowService._types.PaginatedParams;

export class WorkflowService extends BaseService<
  typeof workflows,
  InsertWorkflows,
  SelectWorkflows
> {
  constructor() {
    super(workflows);
  }
  async listAllPaginatedWorkflows(params: WorkflowSimplePaginationConfig = {}) {
    const { mode, sort = "desc", ...rest } = params;
    if (mode === "offset") {
      const listresp = await this.paginateOffset({
        ...rest,
        sort,
        where: rest.where,
      });
      return listresp;
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

  private async populateNodes(workflowIds: UUID[]) {
    const nodesResp = await nodeService.findMany((table) =>
      inArray(table.workflowId, workflowIds)
    );
    if (!nodesResp.data) {
      return {};
    }
    return nodesResp.data?.reduce((acc, node) => {
      if (!node || !node.workflowId) return acc;
      if (acc[node.workflowId]) {
        acc[node.workflowId]!.push(node);
      } else {
        acc[node.workflowId] = [node];
      }
      return acc;
    }, {} as Record<string, (typeof nodesResp.data)[0][]>);
  }

  async listAllPaginatedWorkflowsV2(params: WorkflowPaginationConfig) {
    const { mode } = params;
    if (mode == "offset") {
      const listresp = await this.paginationOffsetRecords({
        ...params,
      });
      // if (listresp.data?.items?.length) {
      //   const nodesMap = await this.populateNodes(
      //     listresp.data.items.map((w) => w.id)
      //   );
      //   listresp.data.items = listresp.data.items.map((workflow) => ({
      //     ...workflow,
      //     nodes: nodesMap[workflow.id] || [],
      //   }));
      // }
      return listresp;
    }
    const listresp = await this.paginationCursorRecords(params);
    // if (listresp.data?.items?.length) {
    //   const nodesMap = await this.populateNodes(
    //     listresp.data.items.map((w) => w.id)
    //   );
    //   listresp.data.items = listresp.data.items.map((workflow) => ({
    //     ...workflow,
    //     nodes: nodesMap[workflow.id] || [],
    //   }));
    // }
    return listresp;
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

    const workflows = await this.findMany((fields) =>
      eq(fields.userId, userId)
    );
    if (workflows.data?.length) {
      const nodesMap = await this.populateNodes(
        workflows.data.map((w) => w.id)
      );
      return {
        data: workflows.data.map((workflow) => ({
          ...workflow,
          nodes: nodesMap[workflow.id] || [],
        })),
        error: null,
      };
    }
    return workflows;
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
    const workflowClient = await this.findOne((fields) =>
      and(eq(fields.id, parseData.id), eq(fields.userId, parseData.userId))
    );
    if (workflowClient.data) {
      const nodes = await this.populateNodes([workflowClient.data.id]);
      return {
        data: {
          ...workflowClient.data,
          nodes: nodes[workflowClient.data.id] || [],
        },
        error: null,
      };
    }
    return workflowClient;
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
    try {
      return await this.withTransaction(async (tx) => {
        const res = await this.create(parseResult.data, tx);

        if (res.error) {
          throw new BadRequestException("Failed to create workflow", {
            errorCode: ErrorCode.DATABASE_ERROR,
          });
        }
        const workflow = res.data;
        const node = await nodeService.createItem(
          {
            workflowId: workflow.id,
            userId: workflow.userId,
            name: NodeType.INITIAL,
            type: NodeType.INITIAL,
            position: { x: 0, y: 0 },
          },
          tx
        );
        if (node.error) {
          throw new BadRequestException("Failed to create initial node", {
            errorCode: ErrorCode.DATABASE_ERROR,
          });
        }
        return { data: { ...workflow, initialNode: node.data }, error: null };
      });
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
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
