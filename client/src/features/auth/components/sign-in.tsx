"use client";

import { z } from "zod";

import { GoogleIcon } from "@/assets/icons";
import ButtonLoader from "@/components/ButtonLoader";
import Form from "@/components/form/Form";
import FormInput from "@/components/form/Input";
import SeparatorText from "@/components/SeparatorText";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useZodForm from "@/hooks/useZodForm";
import { useStoreAuthActions } from "@/store/userAuthStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useSignIn } from "../api/hooks";
import { SIGN_IN_SCHEMA, SignInSchemaType } from "../schema";

/* -------------------------- Zod Validation -------------------------- */
const authSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type AuthFormValues = z.infer<typeof authSchema>;

/* ------------------------- Component Props ------------------------- */
interface AuthFormProps {
  mode?: "signin" | "signup";
  onSubmit: (data: AuthFormValues) => void;
  onOAuthClick?: (provider: "google" | "github") => void;
  switchMode?: () => void;
}

/* ---------------------------- Component ---------------------------- */
const SignInScreen = ({}) => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isSocialLogginIn, setIsSocialLogginIn] = useState(false);
  const setUser = useStoreAuthActions().setUser;

  const { handleSignIn } = useSignIn();
  const form = useZodForm({
    schema: SIGN_IN_SCHEMA,
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = async (e: SignInSchemaType) => {
    try {
      const parseResult = SIGN_IN_SCHEMA.safeParse(e);
      if (!parseResult.success) {
        toast.error("Please provide a valid data");
        return {
          message: parseResult.error.message,
          error: true,
          success: false,
        };
      }
      const { data, message } = await handleSignIn(e);

      if (data?.id) {
        toast.success(message);
        const { accessToken, refreshToken, accounts = [], ...rest } = data;
        setUser({
          user: rest,
          accounts: accounts,
          isAuthenticated: true,
          isLoggedIn: true,
          isAuthenticating: false,

          accessToken,
          refreshToken,
        });
        router.replace("/");
      } else {
        toast.error(message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const SignInWithG = async () => {
    try {
      setIsSocialLogginIn(true);
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/google`;
    } catch {
    } finally {
      setIsSocialLogginIn(false);
    }
  };
  const { formState } = form;
  const isFormSubmitting = formState.isSubmitting || isSocialLogginIn;
  // bg-[url(/img/auth-bg.jpg)] bg-cover
  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full my-auto max-w-md mx-auto shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sign in to your account using your email or continue with social
            login.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* ---------- OAuth Buttons ---------- */}
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="flex justify-center gap-2 cursor-pointer"
              onClick={() => SignInWithG()}
            >
              <GoogleIcon />
              Sign in with Google
            </Button>
          </div>

          <SeparatorText className="my-4  text-center w-full" text="OR" />

          {/* ---------- Email / Password Form ---------- */}
          <Form form={form} onSubmit={onSubmit} className="grid gap-4">
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
            />

            <ButtonLoader type="submit" className="mt-2">
              Sign In
            </ButtonLoader>
          </Form>

          {/* ---------- Switch Mode Link ---------- */}
          <div className="  gap-1 pt-1 text-sm flex justify-center my-2">
            <span className="text-gray-400">Don&apos;t have an account?</span>
            <Link href={"/sign-up"} className="text-blue-400 hover:underline">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInScreen;
