"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  confirmSubscribe,
  type SubscribeConfirmResponse,
} from "@/lib/api/subscriber";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { toast } from "sonner";

type ConfirmStatus = "loading" | "success" | "error";

export default function SubscribeConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<ConfirmStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmResponse, setConfirmResponse] =
    useState<SubscribeConfirmResponse | null>(null);
  const hasCalledRef = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("유효하지 않은 링크입니다.");
      return;
    }

    // 중복 호출 방지
    if (hasCalledRef.current) {
      return;
    }
    hasCalledRef.current = true;

    // API 호출
    confirmSubscribe(token)
      .then((result) => {
        setStatus("success");
        setConfirmResponse(result);
        toast.success("구독이 확인되었습니다!");
      })
      .catch((error: any) => {
        setStatus("error");
        const message =
          error.message || "구독 확인에 실패했습니다. 다시 시도해주세요.";
        setErrorMessage(message);
        toast.error(message);
      });
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">구독을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
              <CloseIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">구독 확인 실패</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              링크가 만료되었거나 이미 사용되었을 수 있습니다.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="w-full"
              variant="outline"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // success
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
            <CheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">구독이 확인되었습니다!</h1>
          <p className="text-muted-foreground">
            {confirmResponse?.email}로 구독이 완료되었습니다.
            <br />
            앞으로 새로운 글이 발행되면 이메일로 알려드립니다.
          </p>
        </div>
        <div className="space-y-2">
          {confirmResponse?.username && confirmResponse?.newsletterSlug ? (
            <Button
              onClick={() =>
                router.push(
                  `/@${confirmResponse.username}/${confirmResponse.newsletterSlug}`
                )
              }
              className="w-full"
            >
              뉴스레터 보기
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/")}
              className="w-full"
            >
              홈으로 돌아가기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

