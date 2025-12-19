"use client";

import { useState, useEffect, useCallback } from "react";
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

interface OnboardingFormProps {
  onComplete?: () => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const router = useRouter();
  const setUser = useSetAtom(userAtom);
  const user = useAtomValue(userAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    bio: "",
  });

  // user에 name이 있으면 기본값으로 설정
  useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({ ...prev, name: user.name || "" }));
    }
  }, [user]);

  // Username 중복 확인 (debounce)
  useEffect(() => {
    const checkUsername = async () => {
      const username = formData.username.trim();
      
      // 최소 길이 체크
      if (username.length < 3) {
        setUsernameError(null);
        return;
      }

      // 현재 사용자의 username과 같으면 체크하지 않음
      if (user?.username === username) {
        setUsernameError(null);
        return;
      }

      setIsCheckingUsername(true);
      setUsernameError(null);

      try {
        const isAvailable = await checkUsernameAvailability(username);
        if (!isAvailable) {
          setUsernameError("이미 사용 중인 사용자명입니다.");
        }
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
      toast.error("사용자명을 입력해주세요.");
      return;
    }

    if (formData.username.length < 3) {
      toast.error("사용자명은 3자 이상이어야 합니다.");
      return;
    }

    // Username 중복 확인
    if (usernameError) {
      toast.error(usernameError);
      return;
    }

    // 최종 중복 확인 (제출 전)
    if (user?.username !== formData.username) {
      try {
        const isAvailable = await checkUsernameAvailability(formData.username);
        if (!isAvailable) {
          toast.error("이미 사용 중인 사용자명입니다.");
          return;
        }
      } catch (error) {
        console.error("Final username check error:", error);
        toast.error("사용자명 확인 중 오류가 발생했습니다.");
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

      toast.success("프로필이 저장되었습니다!");
      
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
      toast.error(errorMessage || "저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 사용자명 */}
      <div className="space-y-2">
        <Label htmlFor="username">
          사용자명 <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="username"
            value={formData.username}
            onChange={handleUsernameChange}
            disabled={isLoading}
            className={`h-11 ${usernameError ? "border-destructive" : ""}`}
            autoFocus
          />
          {isCheckingUsername && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          )}
        </div>
        {usernameError ? (
          <p className="text-xs text-destructive">{usernameError}</p>
        ) : formData.username.length >= 3 && !isCheckingUsername && !usernameError ? (
          <p className="text-xs text-[#2563EB] dark:text-[#38BDF8]">
            사용 가능한 사용자명입니다.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            vality.io/@{formData.username || "username"}
          </p>
        )}
      </div>

      {/* 이름 */}
      <div className="space-y-2">
        <Label htmlFor="name">이름 (선택)</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="홍길동"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          className="h-11"
        />
      </div>

      {/* 소개 */}
      <div className="space-y-2">
        <Label htmlFor="bio">소개 (선택)</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="간단한 소개를 작성하세요"
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
          !!usernameError ||
          isCheckingUsername
        }
      >
        {isLoading ? "저장 중..." : "시작하기"}
      </Button>
    </form>
  );
}

