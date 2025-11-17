import { PageLoader } from "@/components/loaders";
import SignInScreen from "@/features/auth/components/sign-in";
import { requireUnAuth } from "@/lib/auth";
import { Suspense } from "react";

const SignInPage = async () => {
  await requireUnAuth();
  return (
    <Suspense fallback={<PageLoader />}>
      <SignInScreen />
    </Suspense>
  );
};

export default SignInPage;
