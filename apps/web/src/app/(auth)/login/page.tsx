import { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "../_components/auth-form";
import { Logo } from "@/components/common";

export const metadata: Metadata = {
  title: "로그인",
  description: "Vality 계정에 로그인하세요",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 items-center px-6">
        <Logo />
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Vality 로그인
            </h1>
          </div>

          <AuthForm mode="login" />

          <p className="text-center text-sm text-muted-foreground">
            계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              회원가입
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
