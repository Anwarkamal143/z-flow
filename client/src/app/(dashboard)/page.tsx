import SignOutBtn from "@/components/sign-out";
import { authSession } from "@/lib/auth";
import { Activity } from "react";

export default async function Home() {
  const res = await authSession();

  return (
    <div>
      {res?.user.id}
      <Activity mode={res != null ? "visible" : "hidden"}>
        <SignOutBtn />
      </Activity>
    </div>
  );
}
