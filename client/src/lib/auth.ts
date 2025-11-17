import "server-only";
//
import { API_BASE_URL, COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/config";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TokenService } from "./server-utils";

export const getAuthCookiesValues = (cookies: ReadonlyRequestCookies) => {
  return {
    accessToken: cookies.get(COOKIE_NAME)?.value,
    refreshToken: cookies.get(REFRESH_COOKIE_NAME)?.value,
  };
};
export const authSession = async (
  isRedirect = true
): Promise<null | {
  accessToken: string | undefined;
  refreshToken: string | undefined;
  user: IServerCookieType;
}> => {
  const cookieStore = await cookies();
  const tokens = getAuthCookiesValues(cookieStore);
  const res = await TokenService.verify(tokens.accessToken);
  if (res.data) {
    return { user: res.data.user, ...tokens };
  }
  if (res.isExpired) {
    const resp = await refreshTokens(tokens.refreshToken as string);
    if (resp) {
      return { ...resp, user: TokenService.decodeToken(resp.accessToken) };
    }
  }
  if (isRedirect) {
    return redirect("/login");
  }
  return null;
};
export const requireUnAuth = async (): Promise<null | {
  accessToken: string | undefined;
  refreshToken: string | undefined;
  user: IServerCookieType;
}> => {
  const cookieStore = await cookies();
  const tokens = getAuthCookiesValues(cookieStore);
  const res = await TokenService.verify(tokens.accessToken);

  if (res.data) {
    return redirect("/");
  }
  return null;
};

async function refreshTokens(refreshToken: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh-tokens`, {
      method: "POST",
      credentials: "include",
      headers: {
        Cookie: `${REFRESH_COOKIE_NAME}=${refreshToken}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;

    // backend sets cookies → Next.js automatically persists them
    const data = await res.json();
    return data?.data;
  } catch (error) {
    return null;
  }
}
