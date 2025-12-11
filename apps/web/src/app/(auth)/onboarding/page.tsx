import { Metadata } from "next";
import { OnboardingForm } from "./onboarding-form";
import { Logo } from "@/components/common";

export const metadata: Metadata = {
  title: "프로필 설정",
  description: "Vality 프로필을 설정하세요",
};

export default function OnboardingPage() {
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
