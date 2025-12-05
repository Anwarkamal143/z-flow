"use client";
import { Loader } from "@/components/loaders";
import { useGetLoggedInUser } from "@/features/user/api";
import {
  useStoreAuthActions,
  useStoreUserIsAuthenticating,
} from "@/store/userAuthStore";
import { ReactNode, useEffect } from "react";
import SocketContextProvider from "./SocketProvider";

type IAppWrapper = {
  children: ReactNode;
};

const AppWrapper = ({ children }: IAppWrapper) => {
  const { data: userData, isLoading: isFirstTimeLoading } =
    useGetLoggedInUser();
  const { setUser } = useStoreAuthActions();
  const isAuthenticating = useStoreUserIsAuthenticating();
  useEffect(() => {
    if (isFirstTimeLoading) return;
    if (userData?.data?.id) {
      const { accounts, accessToken, refreshToken, ...rest } = userData.data;
      setUser({
        user: rest,
        accounts,
        isAuthenticated: true,
        isLoggedIn: true,
        isAuthenticating: false,
        isTokensRefreshing: false,
        accessToken,
        refreshToken,
      });
      return;
    }
    setUser({
      user: undefined,
      accounts: undefined,
      isAuthenticated: false,
      isLoggedIn: false,
      isAuthenticating: false,
      isTokensRefreshing: false,
      accessToken: undefined,
      refreshToken: undefined,
    });
    return () => {};
  }, [isFirstTimeLoading]);
  const isLoading = isFirstTimeLoading || isAuthenticating;
  if (isLoading) {
    return <Loader size="xlg" full />;
  }

  return <SocketContextProvider>{children}</SocketContextProvider>;
};

export default AppWrapper;
