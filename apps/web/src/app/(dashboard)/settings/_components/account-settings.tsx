"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// 목업 사용자 데이터
const MOCK_USER = {
  email: "john@example.com",
};

export function AccountSettings() {
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [emailData, setEmailData] = useState({
    currentEmail: MOCK_USER.email,
    newEmail: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailData.newEmail) {
      toast.error("새 이메일을 입력해주세요.");
      return;
    }

    setIsEmailLoading(true);
    try {
      // TODO: API 연동
      console.log("Email change:", emailData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("인증 이메일이 발송되었습니다. 새 이메일을 확인해주세요.");
      setEmailData((prev) => ({ ...prev, newEmail: "" }));
    } catch (error) {
      console.error("Email change error:", error);
      toast.error("이메일 변경에 실패했습니다.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      toast.error("현재 비밀번호를 입력해주세요.");
      return;
    }
    if (!passwordData.newPassword) {
      toast.error("새 비밀번호를 입력해주세요.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setIsPasswordLoading(true);
    try {
      // TODO: API 연동
      console.log("Password change");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("비밀번호가 변경되었습니다.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("비밀번호 변경에 실패했습니다.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "계정 삭제") {
      toast.error('"계정 삭제"를 정확히 입력해주세요.');
      return;
    }

    setIsDeleteLoading(true);
    try {
      // TODO: API 연동
      console.log("Delete account");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("계정이 삭제되었습니다.");
      // 로그아웃 및 리다이렉트
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("계정 삭제에 실패했습니다.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Email Change */}
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">이메일 변경</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            로그인에 사용되는 이메일을 변경합니다.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentEmail">현재 이메일</Label>
          <Input
            id="currentEmail"
            value={emailData.currentEmail}
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newEmail">새 이메일</Label>
          <Input
            id="newEmail"
            type="email"
            value={emailData.newEmail}
            onChange={(e) =>
              setEmailData((prev) => ({ ...prev, newEmail: e.target.value }))
            }
            placeholder="new@example.com"
            disabled={isEmailLoading}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="outline"
            disabled={isEmailLoading || !emailData.newEmail}
          >
            {isEmailLoading ? "처리 중..." : "이메일 변경"}
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Password Change */}
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">비밀번호 변경</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            계정 보안을 위해 주기적으로 비밀번호를 변경하세요.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentPassword">현재 비밀번호</Label>
          <Input
            id="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            placeholder="현재 비밀번호"
            disabled={isPasswordLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">새 비밀번호</Label>
          <Input
            id="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
            placeholder="새 비밀번호 (8자 이상)"
            disabled={isPasswordLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            placeholder="새 비밀번호 확인"
            disabled={isPasswordLoading}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="outline"
            disabled={
              isPasswordLoading ||
              !passwordData.currentPassword ||
              !passwordData.newPassword
            }
          >
            {isPasswordLoading ? "처리 중..." : "비밀번호 변경"}
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Delete Account */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-destructive">계정 삭제</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
          </p>
        </div>

        {!showDeleteConfirm ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            계정 삭제
          </Button>
        ) : (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-4">
            <p className="text-sm text-destructive">
              정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="space-y-2">
              <Label htmlFor="deleteConfirm" className="text-sm">
                확인을 위해 <strong>&quot;계정 삭제&quot;</strong>를 입력하세요
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
                onClick={handleDeleteAccount}
                disabled={isDeleteLoading || deleteConfirmText !== "계정 삭제"}
              >
                {isDeleteLoading ? "삭제 중..." : "영구 삭제"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

