import { HTTPSTATUS } from "@/config/http.config";
import { eq } from "@/db";
import { InsertWorkflows, InsertWorkflowsSchema } from "@/schema/workflow";
import { IPaginatedParams } from "@/services/base.service";
import { workflowService } from "@/services/workflow.service";
import { formatZodError } from "@/utils";
import { BadRequestException, ValidationException } from "@/utils/catch-errors";
import { SuccessResponse } from "@/utils/requestResponse";
import { FastifyReply, FastifyRequest } from "fastify";
import { generateSlug } from "random-word-slugs";
class WorkflowController {
  public async create(
    req: FastifyRequest<{ Body: InsertWorkflows }>,
    rep: FastifyReply
  ) {
    const userId = req.user!.id;
    const workflow = req.body;
    if (!workflow.name) {
      workflow.name = generateSlug();
    }
    workflow.userId = userId;

    const parseResult = InsertWorkflowsSchema.safeParse(workflow);
    if (parseResult.error) {
      throw new ValidationException(
        "Invalid or missing data",
        formatZodError(parseResult.error)
      );
    }

    const result = await workflowService.createWorkflow(parseResult.data);

    if (result.error) {
      throw result.error;
    }

    return SuccessResponse(rep, {
      data: result.data,
      statusCode: HTTPSTATUS.CREATED,
      message: "Workflow created",
    });
  }

  /**
   * Stream AI text output using Server-Sent Events
   */
  public async updateName(
    req: FastifyRequest<{ Body: { name: string }; Params: { id: string } }>,
    rep: FastifyReply
  ) {
    if (!(req.body.name || "").trim()) {
      throw new BadRequestException("Name is required");
    }
    const userId = req.user?.id;
    const updatedWorkFlow =
      await workflowService.updateWorkflowNameByIdAndUserId(
        req.body.name,
        req.params.id,
        userId
      );
    if (updatedWorkFlow.error) {
      throw updatedWorkFlow.error;
    }

    return SuccessResponse(rep, {
      message: "Workflow Name is updated",
      data: updatedWorkFlow.data,
    });
  }
  public async getById(
    req: FastifyRequest<{ Params: { id: string } }>,
    _rep: FastifyReply
  ) {
    const workflowId = req.params.id;
    const userId = req.user?.id;
    if (!(workflowId || "").trim()) {
      throw new BadRequestException("Id is required");
    }
    const workflow = await workflowService.getByIdAndUserId(workflowId, userId);
    if (workflow.error) {
      throw workflow.error;
    }

    return SuccessResponse(_rep, {
      message: "workflow found",
      data: workflow.data,
    });
  }
  public async deleteById(
    req: FastifyRequest<{ Params: { id: string } }>,
    _rep: FastifyReply
  ) {
    const workflowId = req.params.id;
    const userId = req.user?.id;

    const workflow = await workflowService.deleteByIdUserId(workflowId, userId);
    if (workflow.error) {
      throw workflow.error;
    }

    return SuccessResponse(_rep, {
      message: "workflow deleted",
      data: workflow.data?.[0],
    });
  }
  public async deleteAll(req: FastifyRequest, _rep: FastifyReply) {
    const userId = req.user?.id;

    const workflow = await workflowService.deleteUserWorkFlows(userId);
    if (workflow.error) {
      throw workflow.error;
    }

    return SuccessResponse(_rep, {
      message: "workflows deleted",
      data: workflow.data,
    });
  }
  public async getAll(
    req: FastifyRequest<{ Querystring: IPaginatedParams }>,
    _rep: FastifyReply
  ) {
    const userId = req.user!.id;
    const params = req.query;
    const { data, pagination_meta, error } =
      await workflowService.listAllPaginatedWorkflows({
        ...params,
        where: (t) => {
          return eq(t.userId, userId);
        },
        cursorColumn: (tableCols) => {
          return tableCols.userId;
        },
      });
    if (error) {
      throw error;
    }

    return SuccessResponse(_rep, {
      message: "workflows found",
      data: { data, pagination_meta },
    });
  }
}

// Export a singleton instance
export default new WorkflowController();
