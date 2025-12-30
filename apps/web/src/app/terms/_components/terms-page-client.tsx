"use client";

import { useT } from "@/hooks/use-translation";
import { useAtomValue } from "jotai";
import { localeAtom } from "@/stores/locale.store";
import { TermsContentKo } from "./terms-content-ko";
import { TermsContentEn } from "./terms-content-en";

export function TermsPageClient() {
  const t = useT();
  const locale = useAtomValue(localeAtom);

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
      <div className="prose prose-sm sm:prose prose-neutral max-w-none dark:prose-invert">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
          {t("legal.termsTitle")}
        </h1>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground">
          {t("common.lastUpdated")}: {locale === "ko" ? "2025년 1월" : "January 2025"}
        </p>

        {locale === "ko" ? <TermsContentKo /> : <TermsContentEn />}
      </div>
    </main>
  );
}

