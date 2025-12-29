"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateProfile, checkUsernameAvailability } from "@/lib/api/auth";
import { userAtom } from "@/stores/auth.store";
import { useSetAtom, useAtomValue } from "jotai";
import { getErrorMessage } from "@/lib/api/client";
import { useT } from "@/hooks/use-translation";

interface OnboardingFormProps {
  onComplete?: () => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const t = useT();
  const router = useRouter();
  const setUser = useSetAtom(userAtom);
  const user = useAtomValue(userAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    bio: "",
  });
  
  // 마지막으로 체크한 username과 결과를 저장
  const lastCheckedRef = useRef<{ username: string; isAvailable: boolean } | null>(null);

  // user에 name이 있으면 기본값으로 설정
  useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({ ...prev, name: user.name || "" }));
    }
  }, [user]);

  // Username 중복 확인 (debounce)
  useEffect(() => {
    const username = formData.username.trim();
    
    // 최소 길이 체크
    if (username.length < 3) {
      setIsUsernameTaken(false);
      return;
    }

    // 현재 사용자의 username과 같으면 체크하지 않음
    if (user?.username === username) {
      setIsUsernameTaken(false);
      return;
    }

    // 이미 같은 username을 체크했으면 API 호출 스킵
    if (lastCheckedRef.current?.username === username) {
      setIsUsernameTaken(!lastCheckedRef.current.isAvailable);
      return;
    }

    const checkUsername = async () => {
      setIsCheckingUsername(true);
      setIsUsernameTaken(false);

      try {
        const isAvailable = await checkUsernameAvailability(username);
        // 결과 캐시
        lastCheckedRef.current = { username, isAvailable };
        setIsUsernameTaken(!isAvailable);
      } catch (error) {
        console.error("Username check error:", error);
        // 에러가 발생해도 사용자에게 표시하지 않음 (네트워크 오류 등)
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500); // 500ms debounce
    return () => clearTimeout(timeoutId);
  }, [formData.username, user?.username]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 영문 소문자, 숫자, 밑줄만 허용
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setFormData((prev) => ({ ...prev, username: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username) {
      toast.error(t("onboarding.enterUsername"));
      return;
    }

    if (formData.username.length < 3) {
      toast.error(t("onboarding.usernameMinLength"));
      return;
    }

    // Username 중복 확인
    if (isUsernameTaken) {
      toast.error(t("onboarding.usernameTaken"));
      return;
    }

    // 최종 중복 확인 (제출 전)
    if (user?.username !== formData.username) {
      try {
        const isAvailable = await checkUsernameAvailability(formData.username);
        if (!isAvailable) {
          toast.error(t("onboarding.usernameTaken"));
          return;
        }
      } catch (error) {
        console.error("Final username check error:", error);
        toast.error(t("onboarding.usernameCheckError"));
        return;
      }
    }

    setIsLoading(true);

    try {
      // API 연동 - 프로필 저장
      const updatedUser = await updateProfile({
        username: formData.username, // 필수
        name: formData.name || undefined,
        bio: formData.bio || undefined,
      });

      // 사용자 정보 업데이트
      setUser(updatedUser);

      toast.success(t("onboarding.profileSaved"));
      
      // 뉴스레터가 있는지 확인 후 다음 단계로 이동
      // 뉴스레터 확인은 부모 컴포넌트에서 처리
      // 여기서는 완료 콜백 호출
      if (onComplete) {
        onComplete();
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Save error:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage || t("onboarding.saveFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 사용자명 */}
      <div className="space-y-2">
        <Label htmlFor="username">
          {t("onboarding.username")} <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="username"
            name="username"
            type="text"
            placeholder={t("onboarding.usernamePlaceholder")}
            value={formData.username}
            onChange={handleUsernameChange}
            disabled={isLoading}
            className={`h-11 ${isUsernameTaken ? "border-destructive" : ""}`}
            autoFocus
          />
          {isCheckingUsername && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          )}
        </div>
        {/* URL 힌트 - 항상 표시 */}
        <p className="text-xs text-muted-foreground">
          vality.io/@{formData.username || "username"}
        </p>
        {/* Validation 상태 */}
        {formData.username.length > 0 && formData.username.length < 3 && (
          <p className="text-xs text-amber-500">
            {t("onboarding.usernameMinLength")}
          </p>
        )}
        {isCheckingUsername && (
          <p className="text-xs text-muted-foreground">
            {t("common.loading")}
          </p>
        )}
        {isUsernameTaken && (
          <p className="text-xs text-destructive">{t("onboarding.usernameTaken")}</p>
        )}
        {formData.username.length >= 3 && !isCheckingUsername && !isUsernameTaken && (
          <p className="text-xs text-[#2563EB] dark:text-[#38BDF8]">
            {t("onboarding.usernameAvailable")}
          </p>
        )}
      </div>

      {/* 이름 */}
      <div className="space-y-2">
        <Label htmlFor="name">{t("onboarding.nameOptional")}</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder={t("onboarding.namePlaceholder")}
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          className="h-11"
        />
      </div>

      {/* 소개 */}
      <div className="space-y-2">
        <Label htmlFor="bio">{t("onboarding.bioOptional")}</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder={t("onboarding.bioPlaceholder")}
          value={formData.bio}
          onChange={handleChange}
          disabled={isLoading}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        className="h-11 w-full"
        disabled={
          isLoading ||
          !formData.username ||
          formData.username.length < 3 ||
          isUsernameTaken ||
          isCheckingUsername
        }
      >
        {isLoading ? t("onboarding.saving") : t("onboarding.startButton")}
      </Button>
    </form>
  );
}
