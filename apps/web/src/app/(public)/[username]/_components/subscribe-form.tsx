"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { publicSubscribe } from "@/lib/api/subscriber";
import { useT } from "@/hooks/use-translation";

interface SubscribeFormProps {
  newsletterId: string;
  variant?: "light" | "dark";
  compact?: boolean;
}

export function SubscribeForm({
  newsletterId,
  variant = "light",
  compact = false,
}: SubscribeFormProps) {
  const t = useT();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(t("public.enterEmail"));
      return;
    }

    setIsLoading(true);

    try {
      const subscriber = await publicSubscribe(newsletterId, { email });
      
      // 성공: PENDING 또는 UNSUBSCRIBED 상태인 경우 이메일 검증 시작
      setIsSubscribed(true);
      toast.success(t("public.subscribeSuccess"));
    } catch (error: any) {
      console.error("Subscribe error:", error);
      
      // ACTIVE 상태인 경우: 이미 구독 중 알림
      const errorMessage = error?.response?.data?.message || error.message || "";
      if (
        errorMessage.includes("이미 구독 중") ||
        errorMessage.includes("already subscribed") ||
        errorMessage.includes("You are already subscribed")
      ) {
        toast.error(t("public.alreadySubscribed"));
      } else {
        // 기타 에러
        toast.error(errorMessage || t("public.subscribeFailed"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg",
          compact ? "py-2 text-sm" : "py-4",
          variant === "dark"
            ? "bg-background/10 text-background"
            : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
        )}
      >
        <CheckIcon className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
        <span className="font-medium">
          {compact ? t("public.subscribedCompact") : t("public.subscribedFull")}
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        placeholder={t("public.emailInputPlaceholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        className={cn(
          compact ? "h-9 text-sm" : "h-11",
          "flex-1",
          variant === "dark" &&
            "border-background/20 bg-background/10 text-background placeholder:text-background/50 focus-visible:ring-background/30"
        )}
      />
      <Button
        type="submit"
        disabled={isLoading || !email}
        size={compact ? "sm" : "default"}
        className={cn(
          compact ? "h-9 px-4" : "h-11 px-6",
          variant === "dark" &&
            "bg-background text-foreground hover:bg-background/90"
        )}
      >
        {isLoading ? "..." : t("public.subscribe")}
      </Button>
    </form>
  );
}
