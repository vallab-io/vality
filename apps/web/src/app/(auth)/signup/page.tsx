import { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "회원가입",
  description: "Vality에 가입하고 나만의 뉴스레터를 시작하세요",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold">
            Vality
          </Link>
          <p className="mt-2 text-muted-foreground">
            나만의 뉴스레터를 시작하세요
          </p>
        </div>

        {/* Signup Form */}
        <SignupForm />

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

