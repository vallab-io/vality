"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
      // TODO: API 연동 - 인증 코드 검증
      console.log("Verifying code:", verificationCode, "for email:", email);

      // 임시: 검증 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 임시: 로컬 스토리지에 저장
      localStorage.setItem(
        "user",
        JSON.stringify({ email, isVerified: true })
      );

      toast.success(mode === "login" ? "로그인 성공!" : "회원가입 성공!");
      
      if (mode === "signup") {
        // 회원가입 시 프로필 설정 페이지로 이동
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("인증 코드가 올바르지 않습니다. 다시 시도해주세요.");
      setCode(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);

    try {
      // TODO: API 연동 - 인증 코드 재발송
      console.log("Resending code to:", email);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("인증 코드가 재발송되었습니다.");
      setCode(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("재발송에 실패했습니다. 다시 시도해주세요.");
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

