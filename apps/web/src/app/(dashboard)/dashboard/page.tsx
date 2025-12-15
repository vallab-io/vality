"use client";

import { useEffect } from "react";
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
import { PageHeader, EmptyState } from "@/components/common";
import {
  SubscribersIcon,
  NewsletterIcon,
  PlusIcon,
  MoreIcon,
} from "@/components/icons";
import { useAtomValue } from "jotai";
import { userAtom, isAuthenticatedAtom, authLoadingAtom } from "@/stores/auth.store";

// 목업 데이터: 실제로는 API에서 가져올 데이터
const MOCK_STATS = {
  totalSubscribers: 128,
  publishedNewsletters: 12,
  draftNewsletters: 3,
};

const MOCK_NEWSLETTERS = [
  {
    id: "clh2issue001abc123def",
    title: "2025년 1월 뉴스레터",
    status: "published" as const,
    publishedAt: "2025-01-15",
    openRate: 42.5,
  },
  {
    id: "clh2issue002abc123def",
    title: "새해 인사 - 2025년을 시작하며",
    status: "published" as const,
    publishedAt: "2025-01-01",
    openRate: 38.2,
  },
  {
    id: "clh2issue004abc123def",
    title: "12월 회고와 내년 계획",
    status: "published" as const,
    publishedAt: "2024-12-28",
    openRate: 45.1,
  },
  {
    id: "clh2issue003abc123def",
    title: "다음 주 발행 예정",
    status: "draft" as const,
    publishedAt: null,
    openRate: null,
  },
];

// 빈 상태 테스트를 위해 true/false 토글
const HAS_DATA = true;

export default function DashboardPage() {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const authLoading = useAtomValue(authLoadingAtom);

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

    // onboarding 완료 확인 (username과 name이 모두 있어야 함)
    if (!user.username) {
      router.push("/onboarding");
      return;
    }
  }, [authLoading, isAuthenticated, user, router]);

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

  const stats = HAS_DATA ? MOCK_STATS : { totalSubscribers: 0, publishedNewsletters: 0, draftNewsletters: 0 };
  const newsletters = HAS_DATA ? MOCK_NEWSLETTERS : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="대시보드"
        description="뉴스레터 현황을 확인하세요"
      >
        <Link href="/dashboard/newsletters/new">
          <Button className="gap-2">
            <PlusIcon className="h-4 w-4" />
            새 뉴스레터
          </Button>
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          icon={<SubscribersIcon className="h-5 w-5" />}
          title="총 구독자"
          value={stats.totalSubscribers.toLocaleString()}
          description="활성 구독자 수"
        />
        <StatsCard
          icon={<NewsletterIcon className="h-5 w-5" />}
          title="발행된 뉴스레터"
          value={stats.publishedNewsletters.toString()}
          description="지금까지 발행한 뉴스레터"
        />
        <StatsCard
          icon={<NewsletterIcon className="h-5 w-5" />}
          title="임시저장"
          value={stats.draftNewsletters.toString()}
          description="작성 중인 뉴스레터"
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      {/* Recent Newsletters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>최근 뉴스레터</CardTitle>
            <CardDescription>최근 작성한 뉴스레터 목록</CardDescription>
          </div>
          {newsletters.length > 0 && (
            <Link href="/dashboard/newsletters">
              <Button variant="ghost" size="sm">
                전체 보기
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {newsletters.length > 0 ? (
            <div className="space-y-1">
              {newsletters.slice(0, 5).map((newsletter) => (
                <NewsletterItem key={newsletter.id} newsletter={newsletter} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📝"
              title="아직 작성한 뉴스레터가 없습니다"
              description="첫 뉴스레터를 작성하고 구독자에게 전달하세요"
            >
              <Link href="/dashboard/newsletters/new">
                <Button>첫 뉴스레터 작성하기</Button>
              </Link>
            </EmptyState>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {newsletters.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <QuickActionCard
            title="새 뉴스레터 작성"
            description="구독자에게 새로운 소식을 전달하세요"
            href="/dashboard/newsletters/new"
            icon={<PlusIcon className="h-5 w-5" />}
          />
          <QuickActionCard
            title="구독자 관리"
            description="구독자 목록을 확인하고 관리하세요"
            href="/dashboard/subscribers"
            icon={<SubscribersIcon className="h-5 w-5" />}
          />
        </div>
      )}
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
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

interface Newsletter {
  id: string;
  title: string;
  status: "published" | "draft";
  publishedAt: string | null;
  openRate: number | null;
}

function NewsletterItem({ newsletter }: { newsletter: Newsletter }) {
  return (
    <Link
      href={`/dashboard/newsletters/${newsletter.id}`}
      className="flex items-center justify-between rounded-lg px-3 py-3 -mx-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{newsletter.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <StatusBadge status={newsletter.status} />
          {newsletter.publishedAt && (
            <span className="text-xs text-muted-foreground">
              {formatDate(newsletter.publishedAt)}
            </span>
          )}
          {newsletter.openRate !== null && (
            <span className="text-xs text-muted-foreground">
              · 오픈율 {newsletter.openRate}%
            </span>
          )}
        </div>
      </div>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
        <MoreIcon className="h-4 w-4" />
      </Button>
    </Link>
  );
}

function StatusBadge({ status }: { status: "published" | "draft" }) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
        발행됨
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
      임시저장
    </span>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function QuickActionCard({ title, description, href, icon }: QuickActionCardProps) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
