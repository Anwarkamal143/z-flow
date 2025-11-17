"use client";

import {
  useCursorGetAllUsers,
  useGetAllUsers
} from "@/features/user/api/hooks";
import { useAuthAccessToken } from "@/store/userAuthStore";
import Link from "next/link";

const page = () => {
  const isAuthenticated = useAuthAccessToken();
  const { data } = useCursorGetAllUsers();
  const { data: users } = useGetAllUsers();
  console.log(
    users?.pagination_meta,
    data?.pages?.[0]?.data?.[0]?.emailVerified
  );
  return (
    <div>
      {isAuthenticated}
      <Link href={"/login"}>Login</Link>
    </div>
  );
};

export default page;
