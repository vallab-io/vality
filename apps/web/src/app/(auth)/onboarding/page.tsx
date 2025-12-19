"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { OnboardingForm } from "./onboarding-form";
import { NewsletterSetupForm } from "./_components/newsletter-setup-form";
import { Logo } from "@/components/common";
import { userAtom, isAuthenticatedAtom, authLoadingAtom } from "@/stores/auth.store";
import { getMyNewsletters } from "@/lib/api/newsletter";

type OnboardingStep = "profile" | "newsletter";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const authLoading = useAtomValue(authLoadingAtom);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("profile");
  const [isCheckingNewsletter, setIsCheckingNewsletter] = useState(true);

  // 인증 및 단계 확인
  useEffect(() => {
    // 인증 초기화가 완료될 때까지 기다림
    if (authLoading) {
      return;
    }

    // 인증 확인
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // 단계 결정
    const determineStep = async () => {
      setIsCheckingNewsletter(true);

      try {
        // username이 없으면 프로필 설정 단계
        if (!user.username) {
          setCurrentStep("profile");
          setIsCheckingNewsletter(false);
          return;
        }

        // username이 있으면 뉴스레터 확인
        const newsletters = await getMyNewsletters();
        if (newsletters.length === 0) {
          setCurrentStep("newsletter");
        } else {
          // 이미 뉴스레터가 있으면 대시보드로 이동
          router.push("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Failed to check newsletters:", error);
        // 에러 발생 시 프로필 설정 단계로
        if (!user.username) {
          setCurrentStep("profile");
        } else {
          setCurrentStep("newsletter");
        }
      } finally {
        setIsCheckingNewsletter(false);
      }
    };

    determineStep();
  }, [authLoading, isAuthenticated, user, router]);

  // 인증 초기화 중이거나 단계 확인 중
  if (authLoading || !isAuthenticated || !user || isCheckingNewsletter) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  const handleProfileComplete = async () => {
    // 프로필 설정 완료 후 뉴스레터 확인
    try {
      const newsletters = await getMyNewsletters();
      if (newsletters.length === 0) {
        setCurrentStep("newsletter");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to check newsletters:", error);
      setCurrentStep("newsletter");
    }
  };

  const handleNewsletterComplete = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 items-center px-6">
        <Logo />
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm space-y-8">
          {currentStep === "profile" ? (
            <>
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  프로필 설정
                </h1>
                <p className="text-sm text-muted-foreground">
                  뉴스레터에서 사용할 정보를 입력하세요
                </p>
              </div>
              <OnboardingForm onComplete={handleProfileComplete} />
            </>
          ) : (
            <>
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  뉴스레터 만들기
                </h1>
                <p className="text-sm text-muted-foreground">
                  첫 번째 뉴스레터를 만들어보세요
                </p>
              </div>
              <NewsletterSetupForm
                onComplete={handleNewsletterComplete}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
