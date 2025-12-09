import PageLoader from "@/components/loaders";
import SignInScreen from "@/features/auth/components/sign-in";
import { Suspense } from "react";

const SignInPage = async () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <SignInScreen />
    </Suspense>
  );
};

export default SignInPage;
