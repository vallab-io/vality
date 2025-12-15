"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { emailAuth, sendVerificationCode } from "@/lib/api/auth";
import { userAtom } from "@/stores/auth.store";
import { useSetAtom } from "jotai";
import { getErrorMessage } from "@/lib/api/client";

interface VerificationCodeFormProps {
  email: string;
  mode: "login" | "signup";
  onBack: () => void;
}

const CODE_LENGTH = 6;

export function VerificationCodeForm({
  email,
  mode,
  onBack,
}: VerificationCodeFormProps) {
  const router = useRouter();
  const setUser = useSetAtom(userAtom);
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 첫 번째 입력 필드에 자동 포커스
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // 숫자만 허용
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // 다음 입력 필드로 이동
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // 모든 코드가 입력되면 자동 제출
    if (newCode.every((digit) => digit) && newCode.join("").length === CODE_LENGTH) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // 백스페이스 처리
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, CODE_LENGTH);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    pastedData.split("").forEach((digit, index) => {
      if (index < CODE_LENGTH) {
        newCode[index] = digit;
      }
    });
    setCode(newCode);

    // 마지막 입력된 위치로 포커스
    const lastIndex = Math.min(pastedData.length, CODE_LENGTH) - 1;
    inputRefs.current[lastIndex]?.focus();

    // 모든 코드가 입력되면 자동 제출
    if (newCode.every((digit) => digit)) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleSubmit = async (verificationCode: string) => {
    setIsLoading(true);

    try {
      // API 연동 - 이메일 인증 로그인/회원가입 (통합)
      const authResponse = await emailAuth(email, verificationCode);

      // 토큰과 사용자 정보 저장
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", authResponse.accessToken);
        localStorage.setItem("refreshToken", authResponse.refreshToken);
      }
      setUser(authResponse.user);

      // username, name이 비어있으면 회원가입으로 간주하고 프로필 설정 페이지로 이동
      const isNewUser = !authResponse.user.username || !authResponse.user.name;
      
      if (isNewUser) {
        toast.success("회원가입 성공! 프로필을 설정해주세요.");
        router.push("/onboarding");
      } else {
        toast.success("로그인 성공!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Verification error:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage || "인증 코드가 올바르지 않습니다. 다시 시도해주세요.");
      setCode(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);

    try {
      // API 연동 - 인증 코드 재발송
      await sendVerificationCode(email);
      toast.success("인증 코드가 재발송되었습니다.");
      setCode(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Resend error:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage || "재발송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 안내 메시지 */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{email}</span>
          <br />
          으로 발송된 6자리 코드를 입력하세요.
        </p>
      </div>

      {/* 코드 입력 */}
      <div className="flex justify-center gap-2">
        {code.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className="h-12 w-12 text-center text-lg font-medium"
          />
        ))}
      </div>

      {/* 로딩 표시 */}
      {isLoading && (
        <p className="text-center text-sm text-muted-foreground">
          확인 중...
        </p>
      )}

      {/* 하단 버튼들 */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-full"
          onClick={handleResend}
          disabled={isResending || isLoading}
        >
          {isResending ? "발송 중..." : "코드 재발송"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="h-11 w-full text-muted-foreground"
          onClick={onBack}
          disabled={isLoading}
        >
          ← 다른 이메일로 시도
        </Button>
      </div>
    </div>
  );
}

