"use client";

import { useT } from "@/hooks/use-translation";

export default function SubscriptionPage() {
  const t = useT();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
        <div className="mb-4 text-6xl">🚀</div>
        <h2 className="text-2xl font-semibold text-foreground">{t("subscription.comingSoon")}</h2>
        <p className="mt-4 max-w-md text-muted-foreground whitespace-pre-line">
          {t("subscription.comingSoonDesc")}
        </p>
      </div>
    </div>
  );
}
