import { APP_CONFIG } from "@/config/app.config";
import { HTTPSTATUS } from "@/config/http.config";
import { logger } from "@/config/logger";
import { AccountType, Provider, UserStatus } from "@/db";
import { ErrorCode } from "@/enums/error-code.enum";
import { getRequestTokens } from "@/middlewares/auth.middleware";
import { IRegisterUser, RegisterUserSchema } from "@/schema/auth";
import { AccountService } from "@/services/accounts.service";
import { UserService } from "@/services/user.service";
import { compareValue, hashValue } from "@/utils/bcrypt";
import {
  BadRequestException,
  InternalServerException,
  UnauthorizedException,
} from "@/utils/catch-errors";
import { resetCookies, setAccessTokenCookie, setCookies } from "@/utils/cookie";
import {
  decodeRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/utils/jwt";
import { deleteRefreshTokenWithJTI, getRefreshTokenByJTI } from "@/utils/redis";
import { SuccessResponse } from "@/utils/requestResponse";
import { FastifyReply, FastifyRequest } from "fastify";

export class AuthController {
  constructor(
    public accountService: AccountService,
    public userService: UserService
  ) {}

  public signUp = async (
    req: FastifyRequest<{ Body: IRegisterUser }>,
    rep: FastifyReply
  ) => {
    try {
      const { password: pas, name, email } = req.body;
      const result = RegisterUserSchema.safeParse(req.body);

      if (!result.success) {
        throw new BadRequestException(result.error?.message, {
          errorCode: ErrorCode.VALIDATION_ERROR,
        });
      }

      const { data: existingUser } = await this.userService.getUserByEmail(
        result.data.email
      );
      if (existingUser) {
        throw new BadRequestException("Email already in use!", {
          errorCode: ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
        });
      }

      const hashedPassword = await hashValue(pas);
      const { data: user } = await this.userService.createUser({
        email,
        password: hashedPassword,
        name: name?.toLowerCase() as string,
      });

      if (!user?.id)
        throw new BadRequestException("Registration failed", {
          errorCode: ErrorCode.BAD_REQUEST,
        });

      await this.accountService.createAccount(user.id);
      const { accessToken, refreshToken } = await setCookies(rep, {
        id: user.id,
        providerType: Provider.email,
        role: user.role,
        provider: AccountType.email,
      });

      const { password, ...restUser } = user;
      return SuccessResponse(rep, {
        message: "Account created successfully!",
        data: { ...restUser, accessToken, refreshToken },
        statusCode: 201,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerException();
    }
  };

  public login = async (
    req: FastifyRequest<{ Body: { email: string; password: string } }>,
    rep: FastifyReply
  ) => {
    try {
      const { email, password } = req.body;
      const { data: user } = await this.userService.getUserByEmail(email, true);
      if (!user || !user.password) {
        throw new BadRequestException("Invalid credentials", {
          errorCode: ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
        });
      }

      if (user.status === UserStatus.INACTIVE) {
        throw new BadRequestException("Your account is inactive", {
          errorCode: ErrorCode.ACCESS_FORBIDDEN,
        });
      }

      const isPasswordMatched = await compareValue(password, user.password);
      if (!isPasswordMatched) {
        throw new BadRequestException("Invalid credentials", {
          errorCode: ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
        });
      }

      const { accessToken, refreshToken } = await setCookies(rep, {
        id: user.id,
        providerType: Provider.email,
        role: user.role,
        provider: AccountType.email,
      });

      const { password: psd, ...restUser } = user;
      return SuccessResponse(rep, {
        message: "Logged in successfully",
        data: { ...restUser, accessToken, refreshToken },
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerException();
    }
  };

  public signOut = async (req: FastifyRequest, rep: FastifyReply) => {
    try {
      try {
        const refreshToken = (req.cookies as any)?.[
          APP_CONFIG.REFRESH_COOKIE_NAME
        ];
        const data = decodeRefreshToken(refreshToken);
        if (data?.token_data?.jti) {
          await deleteRefreshTokenWithJTI(data.token_data.jti);
        }
      } catch (_) {}
      resetCookies(rep);
      return SuccessResponse(rep, { message: "Logged out" });
    } catch (error) {
      throw new InternalServerException("Failed to sign out", {
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      });
    }
  };

  public refreshTokens = async (req: FastifyRequest, rep: FastifyReply) => {
    try {
      const refreshToken = (req.cookies?.[APP_CONFIG.REFRESH_COOKIE_NAME] ||
        req.headers.refreshtoken) as string;
      if (!refreshToken)
        throw new BadRequestException("You are not logged in", {
          errorCode: ErrorCode.AUTH_UNAUTHORIZED_ACCESS,
        });

      const tokenData = await verifyRefreshToken(refreshToken);
      if (!tokenData?.data?.token_data?.jti)
        throw new BadRequestException("Invalid refresh token", {
          errorCode: ErrorCode.AUTH_INVALID_TOKEN,
        });

      const { jti } = tokenData.data.token_data;
      const userData = tokenData.data.user;

      const storedRefreshToken = await getRefreshTokenByJTI(jti);
      if (!storedRefreshToken || storedRefreshToken.token !== refreshToken) {
        resetCookies(rep);
        await deleteRefreshTokenWithJTI(jti);
        logger.error({
          userId: userData.id,
          type: "REUSE_DETECTED",
          status: "REJECTED",
          ip: req.ip,
          userAgent: req.headers["user-agent"],
        });
        throw new BadRequestException("Refresh token reuse detected", {
          errorCode: ErrorCode.AUTH_TOKEN_REUSED,
        });
      }

      const user = await this.userService.getUserById(userData.id);
      if (!user?.data?.id) {
        resetCookies(rep);
        await deleteRefreshTokenWithJTI(jti);
        return SuccessResponse(rep, {
          message: "Token is not refreshed",
          data: null,
          statusCode: HTTPSTATUS.UNAUTHORIZED,
        });
      }

      const { accessToken } = await setAccessTokenCookie(rep, { ...userData });
      logger.info({
        userId: userData.id,
        type: "REFRESH",
        status: "SUCCESS",
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      return SuccessResponse(rep, {
        message: "Token refreshed",
        data: { accessToken, refreshToken },
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerException();
    }
  };

  public verifyAndCreateTokens = async (
    req: FastifyRequest,
    rep: FastifyReply
  ) => {
    try {
      let { accessToken, refreshToken } = getRequestTokens(req);

      if (!accessToken && !refreshToken)
        throw new UnauthorizedException("Not authenticated");

      let tokenPayload = await verifyAccessToken(accessToken);

      if (tokenPayload.data) {
        return SuccessResponse(rep, {
          message: "Tokens Verified",
          data: {
            accessToken,
            refreshToken,
            user: tokenPayload.data.user,
            isAccessTokenExpired: false,
          },
        });
      }

      if (!tokenPayload.data && refreshToken)
        tokenPayload = await verifyRefreshToken(refreshToken);
      if (!tokenPayload.data)
        throw new UnauthorizedException("Invalid or expired token", {
          errorCode: ErrorCode.AUTH_INVALID_TOKEN,
        });

      const refreshTokenByJTI = await getRefreshTokenByJTI(
        tokenPayload.data.token_data.jti
      );
      if (!refreshTokenByJTI || refreshTokenByJTI.token !== refreshToken) {
        resetCookies(rep);
        throw new UnauthorizedException("Invalid or expired token", {
          errorCode: ErrorCode.AUTH_INVALID_TOKEN,
        });
      }

      const userData = await this.userService.getUserById(
        tokenPayload.data.user.id
      );
      const respUser = userData?.data;
      if (!respUser?.id) {
        resetCookies(rep);
        throw new UnauthorizedException("Invalid or expired token", {
          errorCode: ErrorCode.AUTH_INVALID_TOKEN,
        });
      }

      const { password, ...user } = respUser;
      const { refreshToken: rToken, accessToken: accToken } = await setCookies(
        rep,
        { ...user }
      );

      return SuccessResponse(rep, {
        message: "Tokens refreshed",
        data: {
          accessToken: accToken,
          refreshToken: rToken,
          user,
          isAccessTokenExpired: true,
        },
      });
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token", {
        errorCode: ErrorCode.AUTH_INVALID_TOKEN,
      });
    }
  };
}

export default new AuthController(new AccountService(), new UserService());
