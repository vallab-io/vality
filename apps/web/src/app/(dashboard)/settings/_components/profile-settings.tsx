"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/common";
import { toast } from "sonner";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom } from "@/stores/auth.store";
import { checkUsernameAvailability, updateProfile } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";

export function ProfileSettings() {
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
  });

  // user 변경 시 폼 초기화
  useEffect(() => {
    setFormData({
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
    });
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Username 유효성 및 중복 확인 (debounce)
  useEffect(() => {
    const check = async () => {
      const username = formData.username.trim().toLowerCase();

      if (username.length === 0) {
        setUsernameError("사용자명을 입력해주세요.");
        return;
      }
      if (username.length < 3) {
        setUsernameError("사용자명은 3자 이상이어야 합니다.");
        return;
      }

      // 기존 username과 동일하면 중복 체크 불필요
      if (user?.username === username) {
        setUsernameError(null);
        return;
      }

      setIsCheckingUsername(true);
      setUsernameError(null);

      try {
        const available = await checkUsernameAvailability(username);
        if (!available) {
          setUsernameError("이미 사용 중인 사용자명입니다.");
        }
      } catch (error) {
        // 네트워크 오류 등은 UI에 노출하지 않음
        console.error("Username check error:", error);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const id = setTimeout(check, 500);
    return () => clearTimeout(id);
  }, [formData.username, user?.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameError) {
      toast.error(usernameError);
      return;
    }

    if (!formData.username || formData.username.trim().length < 3) {
      toast.error("사용자명은 3자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);

    try {
      const updated = await updateProfile({
        username: formData.username.trim().toLowerCase(),
        name: formData.name || undefined,
        bio: formData.bio || undefined,
      });
      setUser(updated);
      toast.success("프로필이 저장되었습니다.");
    } catch (error) {
      console.error("Profile update error:", error);
      const msg = getErrorMessage(error);
      toast.error(msg || "프로필 저장에 실패했습니다.");
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
            imageUrl={undefined}
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
        {usernameError ? (
          <p className="text-xs text-destructive">{usernameError}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            영문, 숫자, 언더스코어(_)만 사용 가능합니다.
          </p>
        )}
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
        <Button type="submit" disabled={isLoading || isCheckingUsername}>
          {isLoading ? "저장 중..." : "저장하기"}
        </Button>
      </div>
    </form>
  );
}

