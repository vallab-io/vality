"use client";

import { useState } from "react";
import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons";
import { toast } from "sonner";
import { startGoogleOAuth } from "@/lib/api/auth";
import { useT } from "@/hooks/use-translation";
import { localeAtom } from "@/stores/locale.store";

export function SocialButtons() {
  const [isLoading, setIsLoading] = useState<"google" | null>(null);
  const t = useT();
  const locale = useAtomValue(localeAtom);

  const handleGoogleLogin = async () => {
    setIsLoading("google");
    try {
      // 백엔드 OAuth 시작 엔드포인트로 리다이렉트 (언어 설정 포함)
      await startGoogleOAuth(locale);
    } catch (error) {
      console.error("Google login error:", error);
      toast.error(t("auth.googleLoginFailed"));
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Google 로그인 */}
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full gap-3"
        onClick={handleGoogleLogin}
        disabled={isLoading !== null}
      >
        <GoogleIcon className="h-[18px] w-[18px]" />
        {isLoading === "google" ? t("auth.connecting") : t("auth.continueWithGoogle")}
      </Button>
    </div>
  );
}
