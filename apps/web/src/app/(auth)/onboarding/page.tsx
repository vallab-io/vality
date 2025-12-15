"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { OnboardingForm } from "./onboarding-form";
import { Logo } from "@/components/common";
import { userAtom, isAuthenticatedAtom, authLoadingAtom } from "@/stores/auth.store";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const authLoading = useAtomValue(authLoadingAtom);

  useEffect(() => {
    // 인증 초기화가 완료될 때까지 기다림
    if (authLoading) {
      return;
    }

    // 인증 확인 (user가 null이면 인증되지 않음)
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
  }, [authLoading, isAuthenticated, user, router]);

  // 인증 초기화 중이거나 인증 확인 중
  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

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
              프로필 설정
            </h1>
            <p className="text-sm text-muted-foreground">
              뉴스레터에서 사용할 정보를 입력하세요
            </p>
          </div>

          <OnboardingForm />
        </div>
      </main>
    </div>
  );
}
