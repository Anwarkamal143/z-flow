"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { GithubIcon, GoogleIcon } from "@/assets/icons";
import Form from "@/components/form/Form";
import FormInput from "@/components/form/Input";
import SeparatorText from "@/components/SeparatorText";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

/* -------------------------- Zod Validation -------------------------- */
const authSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
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
export const AuthForm: React.FC<AuthFormProps> = ({
  mode = "signin",
  onSubmit,
  onOAuthClick,
  switchMode
}) => {
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" }
  });
  const handleSubmit = (values: AuthFormValues) => {};
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-200 dark:border-gray-700">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to your account using your email or continue with social login."
            : "Enter your details to create a new account or continue with social login."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* ---------- OAuth Buttons ---------- */}
        <div className="grid gap-3">
          <Button
            variant="outline"
            className="flex justify-center gap-2 cursor-pointer"
            onClick={() => onOAuthClick?.("google")}
          >
            <GoogleIcon />
            {mode === "signin" ? "Sign in with Google" : "Sign up with Google"}
          </Button>

          <Button
            variant="outline"
            className="flex justify-center gap-2 cursor-pointer"
            onClick={() => onOAuthClick?.("github")}
          >
            <GithubIcon />
            {mode === "signin" ? "Sign in with GitHub" : "Sign up with GitHub"}
          </Button>
        </div>

        <SeparatorText className="my-4  text-center w-full" text="OR" />

        {/* ---------- Email / Password Form ---------- */}
        <Form form={form} onSubmit={handleSubmit} className="grid gap-4">
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

          <Button type="submit" className="mt-2">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </Form>

        {/* ---------- Switch Mode Link ---------- */}
        <p className="px-1 text-sm text-center text-muted-foreground mt-4">
          {mode === "signin" ? "New here? " : "Already have an account? "}
          <span
            className="underline cursor-pointer underline-offset-4 hover:text-primary"
            onClick={switchMode}
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </span>
        </p>
      </CardContent>
    </Card>
  );
};
