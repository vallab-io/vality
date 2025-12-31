"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { unsubscribe } from "@/lib/api/subscriber";
import { useT } from "@/hooks/use-translation";

type UnsubscribeStatus = "idle" | "loading" | "success" | "error" | "already";

export default function UnsubscribePageClient() {
  const searchParams = useSearchParams();
  const t = useT();
  
  const [status, setStatus] = useState<UnsubscribeStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const newsletterId = searchParams.get("newsletter");
  const email = searchParams.get("email");

  // URL 파라미터가 있으면 자동으로 구독 취소 처리
  useEffect(() => {
    if (newsletterId && email && status === "idle") {
      handleUnsubscribe();
    }
  }, [newsletterId, email]);

  const handleUnsubscribe = async () => {
    if (!newsletterId || !email) {
      setStatus("error");
      setErrorMessage(t("unsubscribe.invalidLink"));
      return;
    }

    setStatus("loading");

    try {
      await unsubscribe(newsletterId, { email });
      setStatus("success");
    } catch (error: any) {
      const message = error.message || "";
      
      if (message.includes("Already unsubscribed") || message.includes("already unsubscribed")) {
        setStatus("already");
      } else if (message.includes("not found") || message.includes("Not found")) {
        setStatus("error");
        setErrorMessage(t("unsubscribe.notFound"));
      } else {
        setStatus("error");
        setErrorMessage(error.message || t("unsubscribe.error"));
      }
    }
  };

  // 잘못된 URL
  if (!newsletterId || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <span className="text-3xl">⚠️</span>
            </div>
          </div>
          <h1 className="mb-3 text-2xl font-semibold text-foreground">
            {t("unsubscribe.invalidLink")}
          </h1>
          <p className="mb-8 text-muted-foreground">
            {t("unsubscribe.invalidLinkDesc")}
          </p>
          <Link href="/home">
            <Button variant="outline">{t("unsubscribe.goHome")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 로딩 중
  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <h1 className="mb-3 text-xl font-semibold text-foreground">
            {t("unsubscribe.processing")}
          </h1>
          <p className="text-muted-foreground">{email}</p>
        </div>
      </div>
    );
  }

  // 구독 취소 성공
  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <span className="text-3xl">✓</span>
            </div>
          </div>
          <h1 className="mb-3 text-2xl font-semibold text-foreground">
            {t("unsubscribe.success")}
          </h1>
          <p className="mb-2 text-muted-foreground">
            {t("unsubscribe.successDesc")}
          </p>
          <p className="mb-8 font-medium text-foreground">{email}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/home">
              <Button variant="outline">{t("unsubscribe.goHome")}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 이미 구독 취소됨
  if (status === "already") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <span className="text-3xl">📭</span>
            </div>
          </div>
          <h1 className="mb-3 text-2xl font-semibold text-foreground">
            {t("unsubscribe.alreadyUnsubscribed")}
          </h1>
          <p className="mb-2 text-muted-foreground">
            {t("unsubscribe.alreadyUnsubscribedDesc")}
          </p>
          <p className="mb-8 font-medium text-foreground">{email}</p>
          <Link href="/home">
            <Button variant="outline">{t("unsubscribe.goHome")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 에러
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <span className="text-3xl">❌</span>
          </div>
        </div>
        <h1 className="mb-3 text-2xl font-semibold text-foreground">
          {t("unsubscribe.errorTitle")}
        </h1>
        <p className="mb-8 text-muted-foreground">
          {errorMessage || t("unsubscribe.error")}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={handleUnsubscribe} variant="default">
            {t("unsubscribe.retry")}
          </Button>
          <Link href="/home">
            <Button variant="outline">{t("unsubscribe.goHome")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

