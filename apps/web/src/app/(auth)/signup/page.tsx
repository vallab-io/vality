import { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "../_components/auth-form";
import { Logo } from "@/components/common";

export const metadata: Metadata = {
  title: "회원가입",
  description: "Vality에 가입하고 나만의 뉴스레터를 시작하세요",
};

export default function SignupPage() {
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
              Vality 시작하기
            </h1>
          </div>

          <AuthForm mode="signup" />

          <p className="text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              로그인
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
