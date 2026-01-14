import { workflowService } from "@/services/workflow.service";
import AppError from "@/utils/app-error";
import {
  BadRequestException,
  InternalServerException,
} from "@/utils/catch-errors";
import { SuccessResponse } from "@/utils/requestResponse";
import { FastifyReply, FastifyRequest } from "fastify";

class WebhooksController {
  public async googleForm(
    req: FastifyRequest<{
      Body: Record<string, any>;
      Querystring: { workflowId: string };
    }>,
    rep: FastifyReply
  ) {
    try {
      const workflowId = req.query.workflowId;
      const body = req.body;
      const formData = {
        formId: body.formId,
        formTitle: body.formTitle,
        responseId: body.responseId,
        timestamp: body.timestamp,
        respondentEmail: body.respondentEmail,
        responses: body.responses,
        raw: body,
      };
      if (!workflowId) {
        throw new BadRequestException(
          "Missing required query parameter: workflowId"
        );
      }
      const resp = await workflowService.executeGoogleFormWorkflow(
        workflowId,
        formData
      );
      if (resp.error) {
        throw resp.error;
      }
      return SuccessResponse(rep, {
        data: resp.data,
        message: "Worklow is executing",
      });
    } catch (error: any) {
      console.log(error.messae, "errorMessage");
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Google form webhook error:", error);
      throw new InternalServerException(
        "Failed to process Google Form submission"
      );
    }
  }
}

export default new WebhooksController();
