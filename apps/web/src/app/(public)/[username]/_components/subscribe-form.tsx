"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface SubscribeFormProps {
  username: string;
  variant?: "light" | "dark";
}

export function SubscribeForm({ username, variant = "light" }: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: API 연동
      console.log("Subscribe:", { email, username });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubscribed(true);
      toast.success("구독 신청이 완료되었습니다! 이메일을 확인해주세요.");
    } catch (error) {
      console.error("Subscribe error:", error);
      toast.error("구독 신청에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg py-4",
          variant === "dark"
            ? "bg-background/10 text-background"
            : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
        )}
      >
        <CheckIcon className="h-5 w-5" />
        <span className="font-medium">구독 신청 완료! 이메일을 확인해주세요.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        placeholder="이메일을 입력하세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        className={cn(
          "h-11 flex-1",
          variant === "dark" &&
            "border-background/20 bg-background/10 text-background placeholder:text-background/50 focus-visible:ring-background/30"
        )}
      />
      <Button
        type="submit"
        disabled={isLoading || !email}
        className={cn(
          "h-11 px-6",
          variant === "dark" &&
            "bg-background text-foreground hover:bg-background/90"
        )}
      >
        {isLoading ? "구독 중..." : "구독하기"}
      </Button>
    </form>
  );
}
