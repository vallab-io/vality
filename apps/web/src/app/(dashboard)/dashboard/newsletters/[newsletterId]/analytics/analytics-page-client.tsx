"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useT } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export default function AnalyticsPageClient() {
  const t = useT();

  // Demo data (until real analytics are implemented)
  const demo = {
    // Period context
    publishedIssuesLast7Days: 6,
    deliveredLast7Days: 3200,
    opensLast7Days: 1498,
    opensDelta: 0.052,
    clicksLast7Days: 394,
    clicksDelta: 0.018,
    growth: 128,
    growthDelta: 34,
    opensSeries: [22, 24, 23, 28, 30, 29, 33, 35, 34, 37, 41, 39, 44, 46],
    clicksSeries: [6, 6, 7, 8, 9, 9, 10, 10, 11, 12, 12, 12, 13, 14],
    growthSeries: [4, 6, 5, 7, 8, 9, 7, 10, 11, 9, 12, 14, 13, 15],
  };

  const opensRate =
    demo.deliveredLast7Days > 0 ? demo.opensLast7Days / demo.deliveredLast7Days : 0;
  const clicksRate =
    demo.deliveredLast7Days > 0 ? demo.clicksLast7Days / demo.deliveredLast7Days : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{t("analytics.description")}</p>
        <div className="shrink-0 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
          {t("analytics.demoDisclaimer")}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title={t("analytics.clicks")}
          value={formatPercent(clicksRate)}
          detail={formatCountWithUnit(demo.clicksLast7Days, t("analytics.clicksCountUnit"))}
          delta={formatDeltaPercent(demo.clicksDelta)}
          deltaTone={demo.clicksDelta >= 0 ? "positive" : "negative"}
          subtitle={`${t("analytics.last7Days")} • ${demo.publishedIssuesLast7Days.toLocaleString()} ${t("analytics.issuesUnit")}`}
          series={demo.clicksSeries}
          accentClassName="text-violet-600"
        />
        <MetricCard
          title={t("analytics.opens")}
          value={formatPercent(opensRate)}
          detail={formatCountWithUnit(demo.opensLast7Days, t("analytics.opensCountUnit"))}
          delta={formatDeltaPercent(demo.opensDelta)}
          deltaTone={demo.opensDelta >= 0 ? "positive" : "negative"}
          subtitle={`${t("analytics.last7Days")} • ${demo.publishedIssuesLast7Days.toLocaleString()} ${t("analytics.issuesUnit")}`}
          series={demo.opensSeries}
          accentClassName="text-blue-600"
        />
        <MetricCard
          title={t("analytics.growth")}
          value={demo.growth.toLocaleString()}
          detail={t("analytics.newSubscribers")}
          delta={formatDeltaNumber(demo.growthDelta)}
          deltaTone={demo.growthDelta >= 0 ? "positive" : "negative"}
          subtitle={t("analytics.last30Days")}
          series={demo.growthSeries}
          accentClassName="text-emerald-600"
        />
      </div>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t("analytics.overviewTitle")}</CardTitle>
          <CardDescription className="text-sm">
            {t("analytics.overviewDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryTile
              icon="📰"
              label={t("analytics.issues")}
              value={`${demo.publishedIssuesLast7Days.toLocaleString()} ${t("analytics.issuesUnit")}`}
              helper={t("analytics.last7Days")}
            />
            <SummaryTile
              icon="📬"
              label={t("analytics.delivered")}
              value={`${demo.deliveredLast7Days.toLocaleString()} ${t("analytics.deliveredUnit")}`}
              helper={t("analytics.last7Days")}
            />
            <SummaryTile
              icon="👀"
              label={t("analytics.opens")}
              value={formatPercent(opensRate)}
              helper={`${demo.opensLast7Days.toLocaleString()} ${t("analytics.opensCountUnit")}`}
            />
            <SummaryTile
              icon="🖱️"
              label={t("analytics.clicks")}
              value={formatPercent(clicksRate)}
              helper={`${demo.clicksLast7Days.toLocaleString()} ${t("analytics.clicksCountUnit")}`}
            />
            <SummaryTile
              icon="📈"
              label={t("analytics.growth")}
              value={`+${demo.growth.toLocaleString()}`}
              helper={t("analytics.newSubscribers")}
            />
          </div>
          <div className="text-xs text-muted-foreground">{t("analytics.demoNote")}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryTile({
  icon,
  label,
  value,
  helper,
}: {
  icon: string;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-foreground">
            {value}
          </div>
          {helper && (
            <div className="mt-1 text-xs text-muted-foreground">{helper}</div>
          )}
        </div>
        <div className="shrink-0 text-xl leading-none">{icon}</div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  delta,
  deltaTone,
  subtitle,
  series,
  accentClassName,
}: {
  title: string;
  value: string;
  detail?: string;
  delta: string;
  deltaTone: "positive" | "negative" | "neutral";
  subtitle: string;
  series: number[];
  accentClassName: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardDescription className="text-xs">{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
        {detail && (
          <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-xs font-medium",
              deltaTone === "positive" && "text-emerald-600",
              deltaTone === "negative" && "text-red-600",
              deltaTone === "neutral" && "text-muted-foreground"
            )}
          >
            {delta}
          </span>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
        <Sparkline series={series} className={accentClassName} />
      </CardContent>
    </Card>
  );
}

function Sparkline({ series, className }: { series: number[]; className?: string }) {
  const width = 240;
  const height = 56;
  const padding = 4;

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = Math.max(1, max - min);

  const points = series.map((v, i) => {
    const x =
      padding + (i * (width - padding * 2)) / Math.max(1, series.length - 1);
    const y =
      padding + (1 - (v - min) / range) * (height - padding * 2);
    return [x, y] as const;
  });

  const d = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");

  const areaD = `${d} L ${width - padding} ${height - padding} L ${padding} ${
    height - padding
  } Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-14 w-full", className)}
      aria-hidden="true"
    >
      <path d={areaD} className="fill-current opacity-10" />
      <path
        d={d}
        className="fill-none stroke-current"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatDeltaPercent(delta: number) {
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${Math.round(delta * 100)}%`;
}

function formatDeltaNumber(delta: number) {
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toLocaleString()}`;
}

function formatCountWithUnit(count: number, unit: string) {
  return `${count.toLocaleString()} ${unit}`;
}
