import { APP_CONFIG } from "@/config/app.config";
import { paginatedQuerySchema } from "@/schema/pagination";
import { UserService } from "@/services/user.service";
import { BadRequestException, NotFoundException } from "@/utils/catch-errors";
import { SuccessResponse } from "@/utils/requestResponse";
import { FastifyReply, FastifyRequest } from "fastify";

class UserController {
  constructor(private userService: UserService) {}

  /**
   * GET /users/me
   */
  public me = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;
    const accessToken = request.cookies?.[APP_CONFIG.COOKIE_NAME];
    const refreshToken = request.cookies?.[APP_CONFIG.REFRESH_COOKIE_NAME];

    const { data } = await this.userService.getUserById(user?.id, true);

    return SuccessResponse(reply, {
      data: { ...(data || {}), accessToken, refreshToken },
      message: user?.id ? "User Found" : "User not found",
    });
  };

  /**
   * GET /users/:id
   */
  public findById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;

    if (!id) {
      throw new BadRequestException("User Id is required");
    }

    const { data, error } = await this.userService.getUserById(id);

    if (error) {
      throw new NotFoundException("User Not Found");
    }

    return SuccessResponse(reply, {
      data,
      message: "User Data",
    });
  };

  /**
   * GET /users
   */
  public findAll = async (request: FastifyRequest, reply: FastifyReply) => {
    // const {
    //   limit = null,
    //   cursor = null,
    //   mode = "offset",
    //   sort = "asc",
    //   page = null,
    // } = request.query as Record<string, string | number>;
    const paginations = paginatedQuerySchema.safeParse(request.query);
    if (!paginations.success) {
      throw new BadRequestException("Invalid pagination parameters");
    }

    const { data, pagination_meta, error } =
      await this.userService.listAllPaginatedUsers({
        ...paginations.data,
      });

    if (error) {
      throw new NotFoundException("User Not Found");
    }

    return SuccessResponse(reply, {
      data: { pagination_meta, data },
      message: "Users Data",
    });
  };
}

export default new UserController(new UserService());
