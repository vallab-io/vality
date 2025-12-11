"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function AccountSettings() {
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

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
    <div className="space-y-6">
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
