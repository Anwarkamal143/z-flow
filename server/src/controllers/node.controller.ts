import { HTTPSTATUS } from "@/config/http.config";
import { InsertNode, InsertNodeSchema, IUpdateUserNode } from "@/schema/node";
import { nodeService } from "@/services/node.service";
import { formatZodError } from "@/utils";
import { ValidationException } from "@/utils/catch-errors";
import { SuccessResponse } from "@/utils/requestResponse";
import { FastifyReply, FastifyRequest } from "fastify";

class NodeController {
  public async create(
    req: FastifyRequest<{ Body: InsertNode }>,
    rep: FastifyReply,
  ) {
    const userId = req.user!.id;
    const node = req.body;

    node.userId = userId;

    const parseResult = InsertNodeSchema.safeParse(node);
    if (parseResult.error) {
      throw new ValidationException(
        "Invalid or missing data",
        formatZodError(parseResult.error),
      );
    }

    const result = await nodeService.createItem(parseResult.data);

    if (result.error) {
      throw result.error;
    }

    return SuccessResponse(rep, {
      data: result.data,
      statusCode: HTTPSTATUS.CREATED,
      message: "Node created",
    });
  }
  public updateNode = async (
    request: FastifyRequest<{
      Body: Omit<IUpdateUserNode, "userId" | "id">;
      Params: { id: string };
    }>,
    reply: FastifyReply,
  ) => {
    const user = request.user?.id as string;
    const nodeId = request.params.id;
    const { data, error } = await nodeService.updateItem({
      ...request.body,
      userId: user,
      id: nodeId,
    });
    if (error) {
      throw error;
    }
    return SuccessResponse(reply, {
      data: null,
      message: data ? "Node Updated" : "Node not found",
    });
  };
}

export default new NodeController();
