import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "로그인",
  description: "Vality 계정에 로그인하세요",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold">
            Vality
          </Link>
          <p className="mt-2 text-muted-foreground">
            계정에 로그인하세요
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

