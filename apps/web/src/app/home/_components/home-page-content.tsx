"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/common";
import { Button } from "@/components/ui/button";
import { getAllPublicIssues, type PublicIssue } from "@/lib/api/public";
import { useAtomValue } from "jotai";
import { userAtom, authLoadingAtom } from "@/stores/auth.store";
import { getMyNewsletters } from "@/lib/api/newsletter";

export function HomePageContent() {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const authLoading = useAtomValue(authLoadingAtom);
  const [issues, setIssues] = useState<PublicIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // 성능 측정 오류 방지를 위해 transition 사용
    startTransition(async () => {
      try {
        // 인증 체크 (대시보드 버튼 표시용만)
        // user atom만 확인하고, API 호출은 하지 않음 (비로그인 사용자도 페이지 접근 가능)
        setIsAuthenticated(!!user);

        // 모든 사용자의 발행된 이슈들 가져오기
        const allIssues = await getAllPublicIssues(50, 0);
        setIssues(allIssues);
      } catch (error) {
        console.error("Failed to load issues:", error);
      } finally {
        setIsLoading(false);
      }
    });
  }, [user]);

  const handleDashboardClick = async () => {
    if (authLoading) return;
    
    if (user) {
      try {
        const newsletters = await getMyNewsletters();
        if (newsletters.length === 0) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Failed to check newsletters:", error);
        router.push("/onboarding");
      }
    } else {
      router.push("/login");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading || isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Logo href="/home" className="text-sm" />
          {isAuthenticated && (
            <Button 
              size="sm" 
              onClick={handleDashboardClick} 
              disabled={authLoading}
              className="bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200"
            >
              대시보드
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">아카이브</h1>
          <p className="mt-2 text-muted-foreground">
            발행된 뉴스레터 이슈들을 탐색하세요.
          </p>
        </div>

        {/* Issues List */}
        {issues.length === 0 ? (
          <div className="mt-12 rounded-lg border border-border py-12 text-center">
            <p className="text-muted-foreground">아직 발행된 이슈가 없습니다.</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              첫 번째 이슈 작성하기 →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {issues.map((issue) => (
              <article
                key={issue.id}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/@${issue.ownerUsername || "unknown"}/${issue.newsletterSlug}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {issue.newsletterName}
                      </Link>
                      <span className="text-muted-foreground">·</span>
                      <time className="text-sm text-muted-foreground">
                        {formatDate(issue.publishedAt)}
                      </time>
                    </div>
                    <Link
                      href={`/@${issue.ownerUsername || "unknown"}/${issue.newsletterSlug}/${issue.slug}`}
                    >
                      <h3 className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                        {issue.title || "Untitled"}
                      </h3>
                    </Link>
                    {issue.excerpt && (
                      <p className="mt-2 text-muted-foreground line-clamp-2">
                        {issue.excerpt}
                      </p>
                    )}
                    <Link
                      href={`/@${issue.ownerUsername || "unknown"}/${issue.newsletterSlug}/${issue.slug}`}
                      className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                    >
                      읽기 →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Vality
            </Link>
            로 만들어진 뉴스레터
          </p>
        </div>
      </footer>
    </div>
  );
}

