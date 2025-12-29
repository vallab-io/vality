"use client";

import Link from "next/link";
import { AuthForm } from "../../_components/auth-form";
import { useT } from "@/hooks/use-translation";

export function SignupPageClient() {
  const t = useT();

  return (
    <main className="flex flex-1 items-center justify-center px-6 pb-20">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("auth.signupTitle")}
          </h1>
        </div>

        <AuthForm mode="signup" />

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.hasAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t("auth.loginLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}

