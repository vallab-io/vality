"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, UserAvatar } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAtomValue, useSetAtom } from "jotai";
import { authLoadingAtom, userAtom } from "@/stores/auth.store";
import {
  getCurrentUser,
  updateProfile,
  deleteAccount,
  checkUsernameAvailability,
} from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import { requestPresignedUrl, uploadImageToS3 } from "@/lib/api/upload";

export default function SettingsPage() {
  const router = useRouter();
  const authLoading = useAtomValue(authLoadingAtom);
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
  });

  // 유저 정보 보장
  useEffect(() => {
    if (authLoading) return;
    if (user) return;

    const fetchUser = async () => {
      try {
        const me = await getCurrentUser();
        setUser(me);
        setFormData({
          name: me.name || "",
          username: me.username || "",
          bio: me.bio || "",
        });
      } catch (error) {
        console.error("Failed to load user", error);
        router.push("/login");
      }
    };

    fetchUser();
  }, [authLoading, user, setUser, router]);

  // user 업데이트 시 폼 동기화
  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || "",
      username: user.username || "",
      bio: user.bio || "",
    });
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Username 유효성 & 중복 확인
  useEffect(() => {
    const check = async () => {
      const username = formData.username.trim().toLowerCase();
      if (!username) {
        setUsernameError("사용자명을 입력하세요.");
        return;
      }
      if (username.length < 3) {
        setUsernameError("사용자명은 3자 이상이어야 합니다.");
        return;
      }
      if (user?.username === username) {
        setUsernameError(null);
        return;
      }
      setIsCheckingUsername(true);
      setUsernameError(null);
      try {
        const available = await checkUsernameAvailability(username);
        if (!available) setUsernameError("이미 사용 중인 사용자명입니다.");
      } catch (error) {
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 검증
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("JPEG, PNG, GIF, WebP 형식만 업로드 가능합니다.");
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error("파일 크기는 2MB 이하여야 합니다.");
      return;
    }

    // 미리보기
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 업로드
    setIsUploadingImage(true);
    try {
      // 1. Presigned URL 요청
      const { presignedUrl, filename } = await requestPresignedUrl({
        type: "user",
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      // 2. S3에 직접 업로드
      await uploadImageToS3(presignedUrl, file);

      // 3. 프로필 업데이트 (파일명 저장)
      const updated = await updateProfile({
        username: formData.username || user?.username || "",
        name: formData.name || undefined,
        bio: formData.bio || undefined,
        imageUrl: filename, // 파일명만 저장
      });

      setUser(updated);
      toast.success("프로필 이미지가 업로드되었습니다.");
      setPreviewImage(null);
    } catch (error) {
      console.error("Image upload error:", error);
      const msg = getErrorMessage(error);
      toast.error(msg || "이미지 업로드에 실패했습니다.");
      setPreviewImage(null);
    } finally {
      setIsUploadingImage(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageRemove = async () => {
    try {
      const updated = await updateProfile({
        username: formData.username || user?.username || "",
        name: formData.name || undefined,
        bio: formData.bio || undefined,
        removeAvatar: true, // 삭제 플래그 설정
      });
      setUser(updated);
      setPreviewImage(null);
      toast.success("프로필 이미지가 제거되었습니다.");
    } catch (error) {
      console.error("Image remove error:", error);
      const msg = getErrorMessage(error);
      toast.error(msg || "이미지 제거에 실패했습니다.");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "계정 삭제") {
      toast.error('"계정 삭제"를 정확히 입력해주세요.');
      return;
    }

    setIsDeleteLoading(true);
    try {
      await deleteAccount();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      toast.success("계정이 삭제되었습니다.");
      router.push("/login");
    } catch (error) {
      console.error("Delete account error:", error);
      const msg = getErrorMessage(error);
      toast.error(msg || "계정 삭제에 실패했습니다.");
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
                name={formData.name || user?.name || user?.email || "사용자"}
                email={user?.email || undefined}
                imageUrl={previewImage || user?.imageUrl || undefined}
                size="lg"
              />
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleImageUpload}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? "업로드 중..." : "이미지 변경"}
                  </Button>
                  {(user?.imageUrl || previewImage) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={handleImageRemove}
                      disabled={isUploadingImage}
                    >
                      삭제
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF, WebP 형식. 최대 2MB
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
              {usernameError ? (
                <p className="text-xs text-destructive">{usernameError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  vality.io/@{formData.username || "username"}
                </p>
              )}
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
              <Button type="submit" disabled={isLoading || isCheckingUsername}>
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
