"use client";
import { GoogleIcon } from "@/assets/icons";
import Form from "@/components/form/Form";
import { FormInput } from "@/components/form/Input";
import SeparatorText from "@/components/SeparatorText";
import { Button } from "@/components/ui/button";
import useZodForm from "@/hooks/useZodForm";

import ButtonLoader from "@/components/ButtonLoader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStoreAuthActions } from "@/store/userAuthStore";
import { IUser } from "@/types/user";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRegisterUser } from "../api/hooks";
import { SIGN_UP_SCHEMA, SignUpSchemaType } from "../schema";

const SignUpScreen = () => {
  const router = useRouter();
  // useIsAuth(true);
  const form = useZodForm({
    schema: SIGN_UP_SCHEMA,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const setUser = useStoreAuthActions().setUser;
  const { handleRegister } = useRegisterUser();

  const onSubmit = async (e: SignUpSchemaType) => {
    console.log(e, "e");
    try {
      const result = await handleRegister(e);
      if (result.success) {
        toast.success(result.message);
        setUser({
          user: result.data as IUser,
          isAuthenticated: true,
          isLoggedIn: true,
          isAuthenticating: false,
        });
        return router.replace("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    }
  };

  const SignInWithG = async () => {
    try {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/google`;
    } catch {}
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full my-auto max-w-md mx-auto shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Create your account to continue.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* ---------- OAuth Buttons ---------- */}
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="flex justify-center gap-2 cursor-pointer"
              onClick={() => SignInWithG?.()}
            >
              <GoogleIcon />
              Sign up with Google
            </Button>
          </div>

          <SeparatorText className="my-4  text-center w-full" text="OR" />

          {/* ---------- Email / Password Form ---------- */}
          <Form form={form} onSubmit={onSubmit} className="grid gap-4">
            <FormInput label="Name" name="name" placeholder="John" />
            <FormInput
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              placeholder="********"
              autoComplete="new-password"
            />
            <FormInput
              label="Confirm password"
              name="confirmPassword"
              type="password"
              placeholder="********"
              autoComplete="new-password"
            />

            <ButtonLoader type="submit" className="mt-2">
              Sign Up
            </ButtonLoader>
          </Form>

          {/* ---------- Switch Mode Link ---------- */}
          <div className="flex  gap-1 text-sm justify-center my-2">
            <span className="text-gray-400">Alreay have an account?</span>
            <Link href={"/login"} className="text-blue-400 hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpScreen;
