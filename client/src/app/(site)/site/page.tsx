"use client";

import {
  useCursorGetAllUsers,
  useGetAllUsers,
} from "@/features/user/api/hooks";
import { useAuthAccessToken, useStoreUser } from "@/store/userAuthStore";
import Link from "next/link";

const page = () => {
  const isAuthenticated = useAuthAccessToken();
  const { data } = useCursorGetAllUsers();
  const { data: users } = useGetAllUsers();
  const user = useStoreUser();
  console.log(users, data?.data.length, user, isAuthenticated, "users---");
  return (
    <div>
      {isAuthenticated}
      <Link href={"/login"}>Login</Link>
    </div>
  );
};

export default page;
