"use client";

import { useState } from "react";
import { PageHeader, UserAvatar } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// 목업 사용자 데이터
const MOCK_USER = {
  name: "John Doe",
  username: "johndoe",
  bio: "프로덕트 디자이너 · 스타트업에서 일하고 있습니다. 디자인, 생산성, 그리고 일하는 방식에 대해 씁니다.",
  avatarUrl: null as string | null,
};

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

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
    toast.info("이미지 업로드는 준비 중입니다.");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "계정 삭제") {
      toast.error('"계정 삭제"를 정확히 입력해주세요.');
      return;
    }

    setIsDeleteLoading(true);
    try {
      console.log("Delete account");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("계정이 삭제되었습니다.");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("계정 삭제에 실패했습니다.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="계정 설정" />

      <div className="mt-8 space-y-6">
        {/* Profile Section */}
        <section className="rounded-lg border border-border">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-medium">프로필</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Profile Image */}
            <div className="flex items-center gap-4">
              <UserAvatar
                name={formData.name}
                imageUrl={MOCK_USER.avatarUrl}
                size="lg"
              />
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleImageUpload}
                >
                  이미지 변경
                </Button>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  JPG, PNG, GIF. 최대 2MB
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름을 입력하세요"
                disabled={isLoading}
              />
            </div>

            {/* Username */}
            <div className="grid gap-2">
              <Label htmlFor="username">사용자명</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                  @
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
                vality.io/@{formData.username}
              </p>
            </div>

            {/* Bio */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio">소개</Label>
                <span className="text-xs text-muted-foreground">
                  {formData.bio.length}/200
                </span>
              </div>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="간단한 자기소개를 작성하세요"
                disabled={isLoading}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "저장 중..." : "변경사항 저장"}
              </Button>
            </div>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="rounded-lg border border-border">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-medium">계정 삭제</h2>
          </div>

          <div className="p-6">
            {!showDeleteConfirm ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  계정과 소유한 모든 뉴스레터가 영구적으로 삭제됩니다.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  계정 삭제
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="grid gap-2">
                  <Label htmlFor="deleteConfirm" className="text-sm">
                    확인을 위해 <strong>계정 삭제</strong>를 입력하세요
                  </Label>
                  <Input
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="계정 삭제"
                    disabled={isDeleteLoading}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText("");
                    }}
                    disabled={isDeleteLoading}
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={isDeleteLoading || deleteConfirmText !== "계정 삭제"}
                  >
                    {isDeleteLoading ? "삭제 중..." : "영구 삭제"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
