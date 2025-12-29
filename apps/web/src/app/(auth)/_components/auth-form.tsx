"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SocialButtons } from "./social-buttons";
import { VerificationCodeForm } from "./verification-code-form";
import { sendVerificationCode } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import { useT } from "@/hooks/use-translation";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const t = useT();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(t("auth.enterEmail"));
      return;
    }

    setIsLoading(true);

    try {
      // API 연동 - 인증 코드 발송
      await sendVerificationCode(email);
      toast.success(t("auth.codeSent"));
      setIsCodeSent(true);
    } catch (error) {
      console.error("Error sending code:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage || t("auth.codeSendFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setIsCodeSent(false);
  };

  // 인증 코드 입력 화면
  if (isCodeSent) {
    return (
      <VerificationCodeForm
        email={email}
        mode={mode}
        onBack={handleBack}
      />
    );
  }

  // 이메일 입력 화면
  return (
    <div className="space-y-6">
      {/* 이메일 입력 */}
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="h-11"
          autoFocus
        />
        <Button
          type="submit"
          className="h-11 w-full"
          disabled={isLoading || !email}
        >
          {isLoading ? t("auth.sending") : t("auth.continueWithEmail")}
        </Button>
      </form>

      {/* 구분선 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{t("auth.or")}</span>
        </div>
      </div>

      {/* 소셜 로그인 */}
      <SocialButtons />
    </div>
  );
}
