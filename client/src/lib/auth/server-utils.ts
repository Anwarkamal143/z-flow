import "server-only";
//
import { JWT_REFRESH_SECRET, JWT_SECRET } from "@/config";
import { RequestOptions } from "@/queries/v1";
import { JWTPayload, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { decodeToken } from "..";

export type VerifyResult =
  | { isExpired: boolean; data: null; error: string | null }
  | {
      isExpired: boolean;
      data: { token_data: JWTPayload; user: IServerCookieType };
      error: null | string;
    };

/**
 * JWT Service Factory
 */
export function createJwtService(options: {
  jwt_secret: string;
  refrest_secret: string;
}) {
  const { jwt_secret, refrest_secret } = options;
  const encodedJWTSecret = new TextEncoder().encode(jwt_secret);
  const encodedRefreshSecret = new TextEncoder().encode(refrest_secret);

  /** Verify a JWT */
  async function verify(
    token: string | null | undefined,
    jwtsecret = encodedJWTSecret
  ): Promise<VerifyResult> {
    if (!token)
      return {
        isExpired: false,
        data: null,
        error: "Not Sign In",
      };
    try {
      const { payload } = await jwtVerify(token, jwtsecret);
      const { iat, exp, jti, ...userData } = payload;
      return {
        isExpired: false,
        data: { token_data: payload, user: userData as IServerCookieType },
        error: null,
      };
    } catch (err: unknown) {
      console.log(err, "err");
      if ((err as any).name === "JWTExpired")
        return { isExpired: true, data: null, error: "Not Sign In" };
      return {
        isExpired: false,
        data: null,
        error: "Not Sign In",
      };
    }
  }

  async function verifyRefreshToken(token: string) {
    return verify(token, encodedRefreshSecret);
  }

  return { verify, verifyRefreshToken, decodeToken };
}

/** ------------------- USAGE ------------------- */

// Access token service
export const TokenService = createJwtService({
  jwt_secret: JWT_SECRET,
  refrest_secret: JWT_REFRESH_SECRET,
});

export const getOptionsWithCookies = async (options: RequestOptions = {}) => {
  const cookieStore = await cookies();
  const newOptions = { ...(options || {}) };

  return {
    ...newOptions,
    requestOptions: {
      ...(newOptions.requestOptions || {}),
      headers: {
        ...(newOptions.requestOptions?.headers || {}),
        cookie: cookieStore.toString(),
      },
    },
  } satisfies RequestOptions;
};
export async function stringifyCookies(tokens?: Record<string, any>) {
  const cookieStore = await cookies();
  if (!tokens) {
    return cookieStore.toString();
  }
  const newCookies = cookieStore.getAll().map((m) => {
    if (m.name == tokens[m.name]) {
      return { ...m, value: tokens[m.name] };
    }
    return m;
  });
  let newCookieString = "";
  newCookies.forEach((ck, index) => {
    newCookieString += `${ck.name}=${ck.value}${
      index != newCookies.length - 1 ? "; " : ""
    }`;
  });
  return newCookieString;
}
export const getCookieAsString = async () => {
  return (await cookies()).toString();
};
