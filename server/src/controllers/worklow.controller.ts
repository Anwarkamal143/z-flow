import { eq } from "@/db";
import { InsertWorkflows, InsertWorkflowsSchema } from "@/schema/workflow";
import { IPaginatedParams } from "@/services/base.service";
import { WorkflowService } from "@/services/workflow.service";
import { formatZodError } from "@/utils";
import { BadRequestException, ValidationException } from "@/utils/catch-errors";
import { SuccessResponse } from "@/utils/requestResponse";
import { FastifyReply, FastifyRequest } from "fastify";
class WorkflowController {
  private workflowService: WorkflowService;

  constructor(workflowService: WorkflowService) {
    this.workflowService = workflowService;
  }

  /**
   * Generate a normal (non-stream) AI response
   */
  public async create(
    req: FastifyRequest<{ Body: InsertWorkflows }>,
    rep: FastifyReply
  ) {
    const workflow = req.body;

    const parseResult = InsertWorkflowsSchema.safeParse(workflow);
    if (parseResult.error) {
      throw new ValidationException(
        "Invalid or missing data",
        formatZodError(parseResult.error)
      );
    }

    const result = await this.workflowService.createWorkflow(parseResult.data);

    if (result.error) {
      throw result.error;
    }

    return SuccessResponse(rep, {
      data: result.data,
      status: "success",
      statusCode: 200,
      message: "Workflow created",
    });
  }

  /**
   * Stream AI text output using Server-Sent Events
   */
  public async updateName(
    req: FastifyRequest<{ Body: { name: string; id: string } }>,
    _rep: FastifyReply
  ) {
    if (!(req.body.name || "").trim()) {
      throw new BadRequestException("Name is required");
    }
  }
  public async getById(
    req: FastifyRequest<{ Body: { id: string } }>,
    _rep: FastifyReply
  ) {
    const workflowId = req.body.id;
    const userId = req.user?.id;
    if (!(workflowId || "").trim()) {
      throw new BadRequestException("Id is required");
    }
    const workflow = await this.workflowService.getByIdAndUserId(
      workflowId,
      userId
    );
    if (workflow.error) {
      throw workflow.error;
    }

    return SuccessResponse(_rep, {
      message: "workflow found",
      data: workflow.data,
    });
  }
  public async get(
    req: FastifyRequest<{ Querystring: IPaginatedParams }>,
    _rep: FastifyReply
  ) {
    const userId = req.user!.id;
    const params = req.query;
    const workflow = await this.workflowService.listAllPaginatedWorkflows({
      ...params,
      where: (t) => {
        return eq(t.userId, userId);
      },
      cursorColumn: (tableCols) => {
        return tableCols.userId;
      },
    });
    if (workflow.error) {
      throw workflow.error;
    }

    return SuccessResponse(_rep, {
      message: "workflow found",
      data: workflow.data,
    });
  }
}

// Export a singleton instance
export default new WorkflowController(new WorkflowService());
