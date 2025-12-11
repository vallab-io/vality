"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/common";
import { toast } from "sonner";

// 목업 사용자 데이터
const MOCK_USER = {
  name: "John Doe",
  username: "johndoe",
  bio: "프로덕트 디자이너 · 스타트업에서 일하고 있습니다. 디자인, 생산성, 그리고 일하는 방식에 대해 씁니다.",
  avatarUrl: null as string | null,
};

export function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: MOCK_USER.name,
    username: MOCK_USER.username,
    bio: MOCK_USER.bio,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: API 연동
      console.log("Profile update:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("프로필이 저장되었습니다.");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("프로필 저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = () => {
    // TODO: 이미지 업로드 구현
    toast.info("이미지 업로드는 준비 중입니다.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile Image */}
      <div className="space-y-3">
        <Label>프로필 이미지</Label>
        <div className="flex items-center gap-4">
          <UserAvatar
            name={formData.name}
            imageUrl={MOCK_USER.avatarUrl}
            size="lg"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleImageUpload}
            >
              이미지 변경
            </Button>
            {MOCK_USER.avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                삭제
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, GIF 형식. 최대 2MB
        </p>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">이름</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="이름을 입력하세요"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          공개 프로필에 표시되는 이름입니다.
        </p>
      </div>

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">사용자명</Label>
        <div className="flex items-center">
          <span className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
            vality.io/@
          </span>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="username"
            disabled={isLoading}
            className="rounded-l-none"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          영문, 숫자, 언더스코어(_)만 사용 가능합니다.
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">소개</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="간단한 자기소개를 작성하세요"
          disabled={isLoading}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          {formData.bio.length}/200자
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "저장 중..." : "저장하기"}
        </Button>
      </div>
    </form>
  );
}

