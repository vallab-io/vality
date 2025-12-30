"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useT } from "@/hooks/use-translation";

// 목업 데이터 (실제로는 API에서 가져와야 함)
const MOCK_NEWSLETTER = {
  name: "John's Weekly",
  slug: "weekly",
  username: "johndoe",
};

type WidgetState = "idle" | "loading" | "success" | "error";

export default function SubscribeWidgetPage() {
  const { newsletterId } = useParams();
  const t = useT();
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
      toast.error(t("subscribers.pleaseEnterEmail"));
      return;
    }

    setWidgetState("loading");
    try {
      // TODO: 실제 구독 API 연동
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setWidgetState("success");
      toast.success(t("public.subscribed"));
      setEmail("");
    } catch (error) {
      console.error("Subscribe error:", error);
      setWidgetState("error");
      toast.error(t("embed.subscribeFailed"));
    } finally {
      setTimeout(() => setWidgetState("idle"), 1200);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      toast.success(t("embed.copied"));
    } catch (error) {
      console.error("Copy error:", error);
      toast.error(t("embed.copyFailed"));
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Preview Section */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("embed.previewTitle")}</p>
            <p className="text-xs text-muted-foreground">
              {t("embed.newsletter")}: {MOCK_NEWSLETTER.name} ({newsletterId})
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <p className="text-sm font-semibold">{MOCK_NEWSLETTER.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("embed.subscribeDesc")}
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs text-muted-foreground">
                  {t("embed.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("embed.emailPlaceholder")}
                  disabled={widgetState === "loading"}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={widgetState === "loading"}
              >
                {widgetState === "loading" ? t("embed.subscribing") : t("embed.subscribe")}
              </Button>
              {widgetState === "success" && (
                <p className="text-xs text-[#2563EB] dark:text-[#38BDF8]">
                  {t("embed.subscribed")}
                </p>
              )}
              {widgetState === "error" && (
                <p className="text-xs text-destructive">
                  {t("embed.errorRetry")}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Embed Code */}
        <div className="space-y-3 rounded-lg border border-border bg-muted/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t("embed.embedCode")}</p>
              <p className="text-xs text-muted-foreground">
                {t("embed.embedCodeDesc")}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleCopy}>
              {t("embed.copyCode")}
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
