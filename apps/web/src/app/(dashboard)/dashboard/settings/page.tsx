"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/common";
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
import { generatePresignedUrl, uploadImageToS3 } from "@/lib/api/upload";
import { useT } from "@/hooks/use-translation";

export default function SettingsPage() {
  const router = useRouter();
  const authLoading = useAtomValue(authLoadingAtom);
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const t = useT();

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
        setUsernameError(t("settings.usernameRequired"));
        return;
      }
      if (username.length < 3) {
        setUsernameError(t("settings.usernameMinLength"));
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
        if (!available) setUsernameError(t("settings.usernameTaken"));
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
      toast.error(t("settings.usernameMinLength"));
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
      toast.success(t("settings.profileSaved"));
    } catch (error) {
      console.error("Profile update error:", error);
      const msg = getErrorMessage(error);
      toast.error(msg || t("settings.profileSaveFailed"));
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
      toast.error(t("settings.imageFormats"));
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error(t("settings.imageSizeLimit"));
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
      const { presignedUrl, filename } = await generatePresignedUrl({
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
      toast.success(t("settings.imageUploaded"));
      setPreviewImage(null);
    } catch (error) {
      console.error("Image upload error:", error);
      const msg = getErrorMessage(error);
      toast.error(msg || t("settings.imageUploadFailed"));
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
      toast.success(t("settings.imageRemoved"));
    } catch (error) {
      console.error("Image remove error:", error);
      const msg = getErrorMessage(error);
      toast.error(msg || t("settings.imageRemoveFailed"));
    }
  };

  const handleDeleteAccount = async () => {
    // 한글/영어 모두 지원
    const confirmTextKo = "계정 삭제";
    const confirmTextEn = "Delete Account";
    if (deleteConfirmText !== confirmTextKo && deleteConfirmText !== confirmTextEn) {
      toast.error(t("settings.deleteConfirmInput"));
      return;
    }

    setIsDeleteLoading(true);
    try {
      await deleteAccount();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      toast.success(t("settings.deleteSuccess"));
      router.push("/login");
    } catch (error) {
      console.error("Delete account error:", error);
      const msg = getErrorMessage(error);
      toast.error(msg || t("settings.deleteFailed"));
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="space-y-6">
        {/* Profile Section */}
        <section className="rounded-lg border border-border">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-medium">{t("settings.profile")}</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Profile Image */}
            <div className="flex items-center gap-4">
              <UserAvatar
                name={formData.name || user?.name || user?.email || t("common.user")}
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
                    {isUploadingImage ? t("settings.uploading") : t("settings.uploadImage")}
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
                      {t("settings.removeImage")}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("settings.imageFormats")}
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">{t("settings.name")}</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("settings.namePlaceholder")}
                disabled={isLoading}
              />
            </div>

            {/* Username */}
            <div className="grid gap-2">
              <Label htmlFor="username">{t("settings.username")}</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                  @
                </span>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={t("settings.usernamePlaceholder")}
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
                <Label htmlFor="bio">{t("settings.bio")}</Label>
                <span className="text-xs text-muted-foreground">
                  {formData.bio.length}/200
                </span>
              </div>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder={t("settings.bioPlaceholder")}
                disabled={isLoading}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading || isCheckingUsername}>
                {isLoading ? t("settings.saving") : t("settings.saveChanges")}
              </Button>
            </div>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="rounded-lg border border-border">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-medium">{t("settings.deleteAccount")}</h2>
          </div>

          <div className="p-6">
            {!showDeleteConfirm ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("settings.deleteAccountDesc")}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  {t("settings.deleteAccountButton")}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("settings.deleteConfirmDesc")}
                </p>
                <div className="grid gap-2">
                  <Label htmlFor="deleteConfirm" className="text-sm">
                    {t("settings.deleteConfirmInput")}
                  </Label>
                  <Input
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={t("settings.deleteAccountButton")}
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
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={isDeleteLoading || (deleteConfirmText !== "계정 삭제" && deleteConfirmText !== "Delete Account")}
                  >
                    {isDeleteLoading ? t("settings.deleting") : t("settings.permanentDelete")}
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
