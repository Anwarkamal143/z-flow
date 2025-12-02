"use client";
import {
  useAuthAccessToken,
  useAuthRefreshToken,
  useStoreAuthActions,
} from "@/store/userAuthStore";

import { getRefreshTokens, signOut } from "@/features/auth/api";
import { decodeToken } from "@/lib";
import { useEffect, useRef } from "react";

export function useTokenRefresher() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const accessToken = useAuthAccessToken();
  const refreshToken = useAuthRefreshToken();
  const authStoreActions = useStoreAuthActions();
  const counter = useRef(0);

  function isExpired(token: string) {
    try {
      const decoded = decodeToken(token);
      if (!decoded) {
        return false;
      }
      const now = Date.now() / 1000;
      return decoded.exp! < now;
    } catch (e) {
      return true;
    }
  }

  async function refreshTokens() {
    try {
      const resp = await getRefreshTokens(refreshToken);
      if (resp) {
        authStoreActions.setTokens({
          ...resp,
          isRefreshing: false,
        });
        counter.current = 0;
        return;
      }
      await signOut();
    } catch (err) {
      console.log("Token refresh failed:", err);
      counter.current = counter.current + 1;
    }
  }

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    intervalRef.current = setInterval(async () => {
      if (counter.current == 2) {
        clearInterval(intervalRef.current!);
        return;
      }
      console.log("console.log after", counter.current);

      if (!accessToken) {
        clearInterval(intervalRef.current!);
        return;
      }

      if (isExpired(accessToken)) {
        console.log("🔄 Access token expired → refreshing…");
        await refreshTokens();
      }
    }, 30_000); // check every 30 sec

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      counter.current = 0;
    };
  }, [accessToken]);
  return null;
}
