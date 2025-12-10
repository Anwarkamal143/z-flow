"use client";
import { useSignOut } from "@/features/auth/api";
import ButtonLoader from "./button-loader";

type Props = {};

const SignOutBtn = (props: Props) => {
  const { signOut } = useSignOut();
  return (
    <ButtonLoader onClick={async () => await signOut()}>LogOut</ButtonLoader>
  );
};

export default SignOutBtn;
