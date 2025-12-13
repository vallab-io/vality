"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleIcon, AppleIcon } from "@/components/icons";
import { toast } from "sonner";

export function SocialButtons() {
  const [isLoading, setIsLoading] = useState<"google" | "apple" | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading("google");
    try {
      // TODO: Google OAuth 연동
      console.log("Google login");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.info("Google 로그인은 곧 지원될 예정입니다.");
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google 로그인에 실패했습니다.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading("apple");
    try {
      // TODO: Apple OAuth 연동
      console.log("Apple login");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.info("Apple 로그인은 곧 지원될 예정입니다.");
    } catch (error) {
      console.error("Apple login error:", error);
      toast.error("Apple 로그인에 실패했습니다.");
    } finally {
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
        {isLoading === "google" ? "연결 중..." : "Google로 계속하기"}
      </Button>

      {/* Apple 로그인 */}
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full gap-3"
        onClick={handleAppleLogin}
        disabled={isLoading !== null}
      >
        <AppleIcon className="h-[18px] w-[18px]" />
        {isLoading === "apple" ? "연결 중..." : "Apple로 계속하기"}
      </Button>
    </div>
  );
}

