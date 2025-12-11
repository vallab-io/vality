"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// 목업 통계 데이터
const MOCK_STATS = {
  totalSubscribers: 1247,
  subscribersGrowth: 12.5,
  totalIssues: 24,
  publishedThisMonth: 4,
  avgOpenRate: 42.3,
  avgClickRate: 8.7,
};

// 목업 이슈 성과 데이터
const MOCK_ISSUE_PERFORMANCE = [
  {
    id: "clh2issue001abc123def",
    title: "2025년 주목할 디자인 트렌드",
    publishedAt: "2025-01-15",
    sent: 1200,
    opened: 540,
    clicked: 108,
    openRate: 45,
    clickRate: 9,
  },
  {
    id: "clh2issue002abc123def",
    title: "디자이너를 위한 생산성 팁 10가지",
    publishedAt: "2025-01-08",
    sent: 1150,
    opened: 483,
    clicked: 92,
    openRate: 42,
    clickRate: 8,
  },
  {
    id: "clh2issue004abc123def",
    title: "2024년 회고: 성장과 변화의 한 해",
    publishedAt: "2024-12-28",
    sent: 1100,
    opened: 440,
    clicked: 77,
    openRate: 40,
    clickRate: 7,
  },
  {
    id: "clh2issue006abc123def",
    title: "크리스마스 특집: 올해의 베스트 아티클",
    publishedAt: "2024-12-24",
    sent: 1080,
    opened: 486,
    clicked: 97,
    openRate: 45,
    clickRate: 9,
  },
];

// 목업 구독자 성장 데이터 (최근 7일)
const MOCK_SUBSCRIBER_GROWTH = [
  { date: "1/9", count: 1180 },
  { date: "1/10", count: 1195 },
  { date: "1/11", count: 1203 },
  { date: "1/12", count: 1215 },
  { date: "1/13", count: 1228 },
  { date: "1/14", count: 1240 },
  { date: "1/15", count: 1247 },
];

// 목업 월별 구독자 성장 데이터
const MOCK_MONTHLY_GROWTH = [
  { date: "8월", count: 450 },
  { date: "9월", count: 620 },
  { date: "10월", count: 780 },
  { date: "11월", count: 950 },
  { date: "12월", count: 1100 },
  { date: "1월", count: 1247 },
];

type TimeRange = "7d" | "30d" | "90d" | "all";

// 아이콘 컴포넌트들
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CursorClickIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

export default function AnalyticsPage() {
  const params = useParams();
  const newsletterId = params.newsletterId as string;
  
  // newsletterId를 활용해 해당 뉴스레터의 통계만 가져올 수 있음
  console.log("Newsletter ID:", newsletterId);
  
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const growthData = timeRange === "7d" ? MOCK_SUBSCRIBER_GROWTH : MOCK_MONTHLY_GROWTH;
  const maxCount = Math.max(...growthData.map((d) => d.count));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader title="통계" description="뉴스레터 성과를 확인하세요." />
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as TimeRange)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">최근 7일</SelectItem>
            <SelectItem value="30d">최근 30일</SelectItem>
            <SelectItem value="90d">최근 90일</SelectItem>
            <SelectItem value="all">전체</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 구독자</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {MOCK_STATS.totalSubscribers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{MOCK_STATS.subscribersGrowth}%</span>{" "}
              지난 달 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">발행된 이슈</CardTitle>
            <MailIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STATS.totalIssues}</div>
            <p className="text-xs text-muted-foreground">
              이번 달 {MOCK_STATS.publishedThisMonth}개 발행
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 오픈율</CardTitle>
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STATS.avgOpenRate}%</div>
            <p className="text-xs text-muted-foreground">업계 평균 대비 우수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 클릭율</CardTitle>
            <CursorClickIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STATS.avgClickRate}%</div>
            <p className="text-xs text-muted-foreground">업계 평균 대비 우수</p>
          </CardContent>
        </Card>
      </div>

      {/* 구독자 성장 차트 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              구독자 성장 추이
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {/* 간단한 바 차트 */}
            <div className="flex h-full items-end justify-between gap-2">
              {growthData.map((data, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-primary transition-all hover:bg-primary/80"
                    style={{
                      height: `${(data.count / maxCount) * 100}%`,
                      minHeight: "8px",
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{data.date}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-sm text-muted-foreground">현재 구독자</p>
              <p className="text-xl font-semibold">
                {growthData[growthData.length - 1].count.toLocaleString()}명
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">기간 내 증가</p>
              <p className="text-xl font-semibold text-green-600">
                +{(growthData[growthData.length - 1].count - growthData[0].count).toLocaleString()}명
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 이슈별 성과 */}
      <Card>
        <CardHeader>
          <CardTitle>이슈별 성과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 테이블 헤더 */}
            <div className="hidden grid-cols-6 gap-4 text-sm font-medium text-muted-foreground sm:grid">
              <div className="col-span-2">이슈</div>
              <div className="text-right">발송</div>
              <div className="text-right">오픈</div>
              <div className="text-right">클릭</div>
              <div className="text-right">오픈율</div>
            </div>

            {/* 이슈 목록 */}
            {MOCK_ISSUE_PERFORMANCE.map((issue) => (
              <div
                key={issue.id}
                className="grid grid-cols-1 gap-2 rounded-lg border border-border p-4 sm:grid-cols-6 sm:items-center sm:gap-4 sm:border-0 sm:p-0"
              >
                <div className="col-span-2">
                  <p className="font-medium line-clamp-1">{issue.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(issue.publishedAt)}
                  </p>
                </div>
                <div className="flex justify-between sm:block sm:text-right">
                  <span className="text-sm text-muted-foreground sm:hidden">발송:</span>
                  <span className="font-medium">{issue.sent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between sm:block sm:text-right">
                  <span className="text-sm text-muted-foreground sm:hidden">오픈:</span>
                  <span className="font-medium">{issue.opened.toLocaleString()}</span>
                </div>
                <div className="flex justify-between sm:block sm:text-right">
                  <span className="text-sm text-muted-foreground sm:hidden">클릭:</span>
                  <span className="font-medium">{issue.clicked.toLocaleString()}</span>
                </div>
                <div className="flex justify-between sm:block sm:text-right">
                  <span className="text-sm text-muted-foreground sm:hidden">오픈율:</span>
                  <div className="flex items-center justify-end gap-2">
                    <div className="hidden h-2 w-16 overflow-hidden rounded-full bg-muted sm:block">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          issue.openRate >= 40 ? "bg-green-500" : "bg-yellow-500"
                        )}
                        style={{ width: `${issue.openRate}%` }}
                      />
                    </div>
                    <span className="font-medium">{issue.openRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 성과 요약 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <EyeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold">{MOCK_STATS.avgOpenRate}%</p>
              <p className="text-sm text-muted-foreground">평균 오픈율</p>
              <p className="mt-2 text-xs text-green-600">업계 평균(21%) 대비 +{(MOCK_STATS.avgOpenRate - 21).toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <CursorClickIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold">{MOCK_STATS.avgClickRate}%</p>
              <p className="text-sm text-muted-foreground">평균 클릭율</p>
              <p className="mt-2 text-xs text-blue-600">업계 평균(2.5%) 대비 +{(MOCK_STATS.avgClickRate - 2.5).toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <TrendingUpIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold">+{MOCK_STATS.subscribersGrowth}%</p>
              <p className="text-sm text-muted-foreground">구독자 성장률</p>
              <p className="mt-2 text-xs text-purple-600">지난 달 대비</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

