"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/common";
import { getCurrentUser } from "@/lib/api/auth";
import { getPublicIssues, type PublicIssue } from "@/lib/api/public";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/auth.store";
import { localeAtom } from "@/stores/locale.store";
import { formatRelativeTime } from "@/lib/utils/date";

export default function HomePageClient() {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const [issues, setIssues] = useState<PublicIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 사용자 정보 가져오기
        let username = user?.username;
        if (!username) {
          const currentUser = await getCurrentUser();
          username = currentUser.username;
          if (!username) {
            // username이 없으면 로그인 페이지로 리다이렉트
            router.push("/login");
            return;
          }
        }
        setCurrentUsername(username);

        // 사용자의 발행된 이슈들 가져오기
        const userIssues = await getPublicIssues(username, undefined, 50, 0);
        setIssues(userIssues);
      } catch (error) {
        console.error("Failed to load issues:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, router]);

  const locale = useAtomValue(localeAtom);
  const formatDateLocal = (dateString: string) => {
    return formatRelativeTime(dateString, locale);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!currentUsername) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Logo href="/" className="text-sm" />
          <div className="flex items-center gap-4">
            <Link
              href={`/@${currentUsername}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              내 프로필
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              대시보드
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">아카이브</h1>
          <p className="mt-2 text-muted-foreground">
            발행한 뉴스레터 이슈들을 확인하세요.
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
                        href={`/@${currentUsername}/${issue.newsletterSlug}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {issue.newsletterName}
                      </Link>
                      <span className="text-muted-foreground">·</span>
                      <time className="text-sm text-muted-foreground">
                        {formatDateLocal(issue.publishedAt)}
                      </time>
                    </div>
                    <Link
                      href={`/@${currentUsername}/${issue.newsletterSlug}/${issue.slug}`}
                    >
                      <h3 className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                        {issue.title || "Untitled"}
                      </h3>
                    </Link>
                    {issue.description && (
                      <p className="mt-2 text-muted-foreground line-clamp-2">
                        {issue.description}
                      </p>
                    )}
                    <Link
                      href={`/@${currentUsername}/${issue.newsletterSlug}/${issue.slug}`}
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

