"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
// import { AppleIcon, GoogleIcon } from "@/components/icons";
import { GoogleIcon } from "@/components/icons";
// AppleIcon은 나중에 구현 예정
import { toast } from "sonner";
import { startGoogleOAuth } from "@/lib/api/auth";

export function SocialButtons() {
  const [isLoading, setIsLoading] = useState<"google" | null>(null);
  // "apple"은 나중에 구현 예정

  const handleGoogleLogin = async () => {
    setIsLoading("google");
    try {
      // 백엔드 OAuth 시작 엔드포인트로 리다이렉트
      await startGoogleOAuth();
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google 로그인에 실패했습니다.");
      setIsLoading(null);
    }
  };

  // 나중에 구현 예정
  // const handleAppleLogin = async () => {
  //   setIsLoading("apple");
  //   try {
  //     // TODO: Apple OAuth 연동
  //     console.log("Apple login");
  //     await new Promise((resolve) => setTimeout(resolve, 1000));
  //     toast.info("Apple 로그인은 곧 지원될 예정입니다.");
  //   } catch (error) {
  //     console.error("Apple login error:", error);
  //     toast.error("Apple 로그인에 실패했습니다.");
  //   } finally {
  //     setIsLoading(null);
  //   }
  // };

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

      {/* Apple 로그인 - 나중에 구현 예정 */}
      {/* <Button
        type="button"
        variant="outline"
        className="h-11 w-full gap-3"
        onClick={handleAppleLogin}
        disabled={isLoading !== null}
      >
        <AppleIcon className="h-[18px] w-[18px]" />
        {isLoading === "apple" ? "연결 중..." : "Apple로 계속하기"}
      </Button> */}
    </div>
  );
}

