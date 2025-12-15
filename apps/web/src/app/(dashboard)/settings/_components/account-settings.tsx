"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { deleteAccount } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom } from "@/stores/auth.store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AccountSettings() {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "계정 삭제") {
      toast.error('"계정 삭제"를 정확히 입력해주세요.');
      return;
    }

    setIsDeleteLoading(true);
    try {
      await deleteAccount();
      // 로컬 상태 정리 후 리다이렉트
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      toast.success("계정이 삭제되었습니다.");
      router.push("/");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("계정 삭제에 실패했습니다.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 사용자 정보 요약 */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1">
        <p className="text-sm text-muted-foreground">이메일</p>
        <p className="text-sm font-medium">{user?.email ?? "-"}</p>
        <p className="text-sm text-muted-foreground mt-3">사용자명</p>
        <p className="text-sm font-medium">
          {user?.username ? `@${user.username}` : "-"}
        </p>
      </div>

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
          onClick={() => setShowWarning(true)}
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

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>계정을 삭제하시겠어요?</AlertDialogTitle>
            <AlertDialogDescription>
              모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다. 계속하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowWarning(false);
                setShowDeleteConfirm(true);
              }}
            >
              계속
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

