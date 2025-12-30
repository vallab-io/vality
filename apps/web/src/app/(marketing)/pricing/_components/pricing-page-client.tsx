"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/icons";
import { useT } from "@/hooks/use-translation";

export function PricingPageClient() {
  const t = useT();

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
          {t("pricing.title")}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          {t("pricing.description")}
        </p>
      </div>

      {/* Early Access Banner */}
      <div className="mt-8 sm:mt-12 rounded-xl border-2 border-primary/20 bg-primary/5 p-6 sm:p-8 md:p-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-primary">
          <span>🎉</span>
          <span>{t("pricing.earlyAccess")}</span>
        </div>
        <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
          {t("pricing.foundingMember")}
        </h2>
        <p className="mt-4 text-base sm:text-lg font-medium text-foreground">
          {t("pricing.foundingMemberDescription").split("\n").map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
        <ul className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 text-sm text-muted-foreground">
          <li className="flex items-center justify-center gap-2">
            <CheckIcon className="h-4 w-4 text-primary" />
            {t("pricing.earlyAccessBenefit1")}
          </li>
          <li className="flex items-center justify-center gap-2">
            <CheckIcon className="h-4 w-4 text-primary" />
            {t("pricing.earlyAccessBenefit2")}
          </li>
          <li className="flex items-center justify-center gap-2">
            <CheckIcon className="h-4 w-4 text-primary" />
            {t("pricing.earlyAccessBenefit3")}
          </li>
        </ul>
        <div className="mt-6 sm:mt-8">
          <Link href="/signup">
            <Button size="lg" className="h-11 sm:h-12 px-6 sm:px-8 text-base font-medium bg-primary hover:bg-primary/90">
              {t("pricing.startButton")}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

