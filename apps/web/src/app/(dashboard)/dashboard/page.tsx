"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PageHeader, EmptyState } from "@/components/common";
import { NewsletterIcon } from "@/components/icons";
import { useAtomValue } from "jotai";
import { userAtom, isAuthenticatedAtom, authLoadingAtom } from "@/stores/auth.store";
import { getDashboardStats, getRecentIssues, type DashboardStats, type RecentIssue } from "@/lib/api/dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const authLoading = useAtomValue(authLoadingAtom);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentIssues, setRecentIssues] = useState<RecentIssue[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    // 인증 초기화가 완료될 때까지 기다림
    if (authLoading) {
      return;
    }

    // 인증 확인 (user가 null이면 인증되지 않음)
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // onboarding 완료 확인
    // username이 없으면 프로필 설정으로
    if (!user.username) {
      router.push("/onboarding");
      return;
    }

    // username은 있지만 뉴스레터가 없으면 뉴스레터 생성으로
    // (뉴스레터 확인은 비동기이므로 여기서는 체크하지 않음)
    // 실제 뉴스레터가 필요한 페이지에서 체크
  }, [authLoading, isAuthenticated, user, router]);

  // 대시보드 데이터 로드
  useEffect(() => {
    if (!isAuthenticated || !user || !user.username) {
      return;
    }

    const loadDashboardData = async () => {
      try {
        setIsDataLoading(true);
        const [statsData, issuesData] = await Promise.all([
          getDashboardStats(),
          getRecentIssues(5),
        ]);
        setStats(statsData);
        setRecentIssues(issuesData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, user]);

  // 인증 초기화 중이거나 인증 및 onboarding 완료 확인 중
  if (authLoading || !isAuthenticated || !user || !user.username) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  const displayStats = stats ?? { totalSubscribers: 0, publishedIssues: 0, draftIssues: 0 };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="대시보드"
        description="뉴스레터 현황을 확인하세요"
      >
        <Link href="/dashboard/newsletters">
          <Button className="gap-2">
            <NewsletterIcon className="h-4 w-4" />
            뉴스레터 관리
          </Button>
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          icon={<NewsletterIcon className="h-5 w-5" />}
          title="총 구독자"
          value={isDataLoading ? "-" : displayStats.totalSubscribers.toLocaleString()}
          description="활성 구독자 수"
        />
        <StatsCard
          icon={<NewsletterIcon className="h-5 w-5" />}
          title="발행된 이슈"
          value={isDataLoading ? "-" : displayStats.publishedIssues.toString()}
          description="지금까지 발행한 이슈"
        />
        <StatsCard
          icon={<NewsletterIcon className="h-5 w-5" />}
          title="임시저장"
          value={isDataLoading ? "-" : displayStats.draftIssues.toString()}
          description="작성 중인 이슈"
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      {/* Recent Published Issues */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>최신 발행된 이슈</CardTitle>
          {recentIssues.length > 0 && (
            <Link href="/dashboard/newsletters">
              <Button variant="ghost" size="sm">
                전체 보기
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {isDataLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : recentIssues.length > 0 ? (
            <div className="space-y-3">
              {recentIssues.map((issue) => (
                <IssueItem key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📝"
              title="아직 발행된 이슈가 없습니다"
              description="첫 이슈를 작성하고 발행하세요"
            >
              <Link href="/dashboard/newsletters">
                <Button>뉴스레터 관리하기</Button>
              </Link>
            </EmptyState>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  className?: string;
}

function StatsCard({ icon, title, value, description, className }: StatsCardProps) {
  return (
    <Card className={cn("group hover:shadow-md transition-all duration-200", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        <div className="text-muted-foreground group-hover:text-primary transition-colors duration-200">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold text-foreground">
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  );
}

function IssueItem({ issue }: { issue: RecentIssue }) {
  // Public 이슈 페이지 URL 생성
  const issueUrl = `/@${issue.ownerUsername}/${issue.newsletterSlug}/${issue.slug}`;
  
  return (
    <Link
      href={issueUrl}
      className="block rounded-lg border border-border p-4 transition-all duration-200 hover:bg-muted/50 hover:border-primary/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate text-foreground">
              {issue.title || "Untitled"}
            </span>
            <span className="shrink-0 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
              발행됨
            </span>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span>{issue.newsletterName}</span>
            {issue.publishedAt && (
              <span>· {formatDateShort(issue.publishedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
