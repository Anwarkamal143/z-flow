import { APP_CONFIG } from "@/config/app.config";
import { paginatedQuerySchema } from "@/schema/pagination";
import { UserService } from "@/services/user.service";
import { BadRequestException, NotFoundException } from "@/utils/catch-errors";
import { resetCookies } from "@/utils/cookie";
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
    if (!data) {
      resetCookies(reply);
    }
    return SuccessResponse(reply, {
      data: data ? { ...data, accessToken, refreshToken } : null,
      message: data ? "User Found" : "User not found",
    });
  };

  /**
   * GET /users/:id
   */
  public findById = async (
    req: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply
  ) => {
    const { userId: id } = req.params;
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
