"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/hooks/use-translation";

export default function AnalyticsPage() {
  const params = useParams();
  const newsletterId = params.newsletterId as string;
  const t = useT();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
        <div className="mb-4 text-6xl">🚀</div>
        <h2 className="text-2xl font-semibold text-foreground">{t("analytics.comingSoon")}</h2>
        <p className="mt-4 max-w-md text-muted-foreground">
          {t("analytics.comingSoonDesc")}
        </p>
      </div>

      {/* 추가될 기능 설명 */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="mb-3 text-2xl">👥</div>
            <h3 className="text-sm font-medium text-foreground mb-2">{t("analytics.subscriberStats")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("analytics.subscriberStatsDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-3 text-2xl">📧</div>
            <h3 className="text-sm font-medium text-foreground mb-2">{t("analytics.emailPerformance")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("analytics.emailPerformanceDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-3 text-2xl">📈</div>
            <h3 className="text-sm font-medium text-foreground mb-2">{t("analytics.issueAnalytics")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("analytics.issueAnalyticsDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-3 text-2xl">📅</div>
            <h3 className="text-sm font-medium text-foreground mb-2">{t("analytics.periodComparison")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("analytics.periodComparisonDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-3 text-2xl">🎯</div>
            <h3 className="text-sm font-medium text-foreground mb-2">{t("analytics.segmentAnalysis")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("analytics.segmentAnalysisDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-3 text-2xl">📊</div>
            <h3 className="text-sm font-medium text-foreground mb-2">{t("analytics.visualCharts")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("analytics.visualChartsDesc")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
