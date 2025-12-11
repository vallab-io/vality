"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function OnboardingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    bio: "",
  });

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

    setIsLoading(true);

    try {
      // TODO: API 연동 - 프로필 저장
      console.log("Saving profile:", formData);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 임시: 로컬 스토리지 업데이트
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, ...formData })
      );

      toast.success("프로필이 저장되었습니다!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("저장에 실패했습니다. 다시 시도해주세요.");
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
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="username"
          value={formData.username}
          onChange={handleUsernameChange}
          disabled={isLoading}
          className="h-11"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          vality.io/@{formData.username || "username"}
        </p>
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
        disabled={isLoading || !formData.username}
      >
        {isLoading ? "저장 중..." : "시작하기"}
      </Button>
    </form>
  );
}

