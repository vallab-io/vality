"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// 목업 데이터 (실제로는 API에서 가져와야 함)
const MOCK_NEWSLETTER = {
  name: "John's Weekly",
  slug: "weekly",
  username: "johndoe",
};

type WidgetState = "idle" | "loading" | "success" | "error";

export default function SubscribeWidgetPage() {
  const { newsletterId } = useParams();
  const [email, setEmail] = useState("");
  const [widgetState, setWidgetState] = useState<WidgetState>("idle");

  // 임베드 코드 템플릿
  const embedCode = `<iframe
  src="https://vality.io/@${MOCK_NEWSLETTER.username}/${MOCK_NEWSLETTER.slug}/subscribe-widget"
  width="100%"
  height="220"
  style="border:1px solid #e5e5e5; border-radius:12px;"
  title="Subscribe to ${MOCK_NEWSLETTER.name}"
></iframe>`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    setWidgetState("loading");
    try {
      // TODO: 실제 구독 API 연동
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setWidgetState("success");
      toast.success("구독이 완료되었습니다.");
      setEmail("");
    } catch (error) {
      console.error("Subscribe error:", error);
      setWidgetState("error");
      toast.error("구독 처리에 실패했습니다.");
    } finally {
      setTimeout(() => setWidgetState("idle"), 1200);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      toast.success("임베드 코드가 복사되었습니다.");
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("복사에 실패했습니다.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title="구독 위젯"
        description="어디서든 붙여넣을 수 있는 임베드 구독 폼입니다."
      />

      {/* Preview Section */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">위젯 미리보기</p>
            <p className="text-xs text-muted-foreground">
              뉴스레터: {MOCK_NEWSLETTER.name} ({newsletterId})
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <p className="text-sm font-semibold">{MOCK_NEWSLETTER.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              최신 소식을 이메일로 받아보세요.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs text-muted-foreground">
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={widgetState === "loading"}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={widgetState === "loading"}
              >
                {widgetState === "loading" ? "구독 중..." : "구독하기"}
              </Button>
              {widgetState === "success" && (
                <p className="text-xs text-green-600">
                  구독이 완료되었습니다. 감사합니다!
                </p>
              )}
              {widgetState === "error" && (
                <p className="text-xs text-destructive">
                  오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Embed Code */}
        <div className="space-y-3 rounded-lg border border-border bg-muted/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">임베드 코드</p>
              <p className="text-xs text-muted-foreground">
                복사해 웹사이트나 블로그에 붙여넣으세요.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleCopy}>
              코드 복사
            </Button>
          </div>
          <Textarea
            value={embedCode}
            readOnly
            className="min-h-[180px] font-mono text-xs"
          />
        </div>
      </section>
    </div>
  );
}

