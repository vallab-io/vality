"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/hooks/use-translation";
import {
  Layers,
  Calendar,
  CreditCard,
  BarChart3,
  Rss,
  Globe,
  Zap,
} from "lucide-react";

export function PricingPageClient() {
  const t = useT();
  const [emailCount, setEmailCount] = useState<string>("");

  const calculatePrice = (count: number): string => {
    if (count === 0) return t("pricing.free");
    if (count <= 1000) return t("pricing.free");
    if (count <= 5000) return "$9";
    if (count <= 10000) return "$19";
    if (count <= 50000) return "$39";
    if (count <= 100000) return "$79";
    return t("pricing.custom");
  };

  const estimatedPrice = emailCount
    ? calculatePrice(parseInt(emailCount) || 0)
    : null;

  const addons = [
    {
      name: t("pricing.addonAdditionalNewsletters"),
      price: "$9",
      icon: Layers,
    },
    {
      name: t("pricing.addonScheduledSending"),
      price: "$9",
      icon: Calendar,
    },
    {
      name: t("pricing.addonPaidSubscription"),
      price: "$9",
      icon: CreditCard,
    },
    {
      name: t("pricing.addonAdvancedAnalytics"),
      price: "$9",
      icon: BarChart3,
    },
    {
      name: t("pricing.addonRssToEmail"),
      price: "$9",
      icon: Rss,
    },
    {
      name: t("pricing.addonCustomDomain"),
      price: "$29",
      icon: Globe,
    },
    {
      name: t("pricing.addonAutomations"),
      price: "$29",
      icon: Zap,
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
      {/* Header */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t("pricing.title")}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("pricing.description")}
        </p>
      </div>

      {/* Beta Free Banner */}
      <div className="relative mt-8 sm:mt-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 sm:p-10 md:p-14 text-center overflow-hidden max-w-2xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 backdrop-blur-sm border border-primary/20 px-4 py-2 text-sm font-medium text-primary shadow-sm">
            <span>🎉</span>
            <span>{t("pricing.betaFree")}</span>
          </div>
          <h2 className="mt-6 sm:mt-8 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            {t("pricing.betaTitle")}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-foreground/90 max-w-2xl mx-auto leading-relaxed">
            {t("pricing.betaDescription")}
          </p>
          <div className="mt-8 sm:mt-10">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                {t("pricing.startButton")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Pricing Calculator */}
      <div className="mt-16 sm:mt-20">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-border bg-card shadow-lg shadow-black/5 p-8 sm:p-10 md:p-12 hover:shadow-xl hover:shadow-black/10 transition-shadow">
            <div className="space-y-8">
              <div>
                <label
                  htmlFor="email-count"
                  className="block text-base font-semibold mb-4 text-foreground"
                >
                  {t("pricing.emailCountInputLabel")}
                </label>
                <Input
                  id="email-count"
                  type="number"
                  placeholder={t("pricing.emailCountPlaceholder")}
                  value={emailCount}
                  onChange={(e) => setEmailCount(e.target.value)}
                  className="w-full h-14 text-lg border-2 focus:border-primary/50 transition-colors"
                  min="0"
                />
              </div>

              {estimatedPrice ? (
                <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 text-center shadow-inner">
                  <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                    {t("pricing.estimatedPrice")}
                  </p>
                  <p className="text-5xl sm:text-6xl font-bold text-primary">
                    {estimatedPrice}
                    {estimatedPrice !== t("pricing.custom") && (
                      <span className="text-2xl text-muted-foreground font-normal">/월</span>
                    )}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-muted/50 p-10 text-center">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {t("pricing.emailCountHint")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add-ons */}
      <div className="mt-20 sm:mt-24">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {t("pricing.addonsTitle")}
          </h2>
          <p className="text-base text-muted-foreground">
            {t("pricing.addonsSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {addons.map((addon, index) => {
            const Icon = addon.icon;
            return (
              <div
                key={index}
                className="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all shadow-sm">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {addon.name}
                    </h3>
                    <p className="text-base font-bold text-foreground">
                      {addon.price}
                      <span className="text-xs font-normal text-muted-foreground ml-1">/월</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

