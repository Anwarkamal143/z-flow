import { getQueryClient } from "@/get-query-client";
import { authClient } from "@/models";
import { resetAllStores } from "@/store/useGlobalStore";
import { AUTH_PATHS } from "../paths";
import useSignOut from "./use-sign-out";
const getRefreshTokens = async (refreshToken?: string) => {
  try {
    const res = await authClient.getRaw<{
      accessToken: string;
      refreshToken: string;
    }>({ slug: "refresh-tokens" });
    console.log(res.data, "res on refreshTokens");
    if (res.data) {
      return res.data;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const signOut = async () => {
  try {
    await authClient.createRaw({
      options: {
        path: AUTH_PATHS.signOut,
      },
    });
  } catch (error) {}
  const client = getQueryClient();
  client.clear();
  resetAllStores();
  // 5. Navigate and refresh cleanly

  window.location.replace("/login");
};

export { getRefreshTokens, signOut, useSignOut };
