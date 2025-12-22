"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Logo } from "@/components/common";
import { Button } from "@/components/ui/button";
import { getAllPublicIssues, type PublicIssue } from "@/lib/api/public";
import { useAtomValue } from "jotai";
import { userAtom, authLoadingAtom } from "@/stores/auth.store";
import { getMyNewsletters } from "@/lib/api/newsletter";
import { Heart } from "lucide-react";

export default function HomePageContent() {
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
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
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
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Logo href="/home" className="text-xl font-bold text-foreground" />
          {isAuthenticated && (
            <Button 
              size="sm" 
              onClick={handleDashboardClick} 
              disabled={authLoading}
              className="font-medium"
            >
              Dashboard
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        {/* Issues List */}
        {issues.length === 0 ? (
          <div className="mt-12 rounded-xl border border-border bg-card py-20 text-center shadow-sm">
            <p className="text-muted-foreground text-lg font-medium">아직 발행된 이슈가 없습니다.</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              첫 번째 이슈 작성하기 →
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue) => (
              <article
                key={issue.id}
                className="group h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md"
              >
                {/* Thumbnail */}
                <Link
                  href={`/@${issue.ownerUsername || "unknown"}/${issue.newsletterSlug}/${issue.slug}`}
                  className="block overflow-hidden"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-muted/60 to-muted/40">
                    {issue.coverImageUrl ? (
                      <Image
                        src={issue.coverImageUrl}
                        alt={issue.newsletterName}
                        fill
                        sizes="(min-width: 1024px) 400px, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        priority={false}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="text-center">
                          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl">📝</span>
                          </div>
                          <p className="text-xs font-medium text-muted-foreground">커버 이미지 없음</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex min-h-[220px] flex-col px-5 pb-5 pt-4">
                  {/* Newsletter & Author Info */}
                  <div className="flex items-center gap-2.5 text-sm">
                    {issue.ownerImageUrl ? (
                      <Link
                        href={`/@${issue.ownerUsername || "unknown"}`}
                        className="flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Image
                          src={issue.ownerImageUrl}
                          alt={issue.ownerName || issue.ownerUsername || "User"}
                          width={28}
                          height={28}
                          className="rounded-full ring-2 ring-border transition-all hover:ring-primary/30"
                        />
                      </Link>
                    ) : (
                      <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20" />
                    )}
                    <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                      <Link
                        href={`/@${issue.ownerUsername || "unknown"}/${issue.newsletterSlug}`}
                        className="truncate font-semibold text-foreground hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {issue.newsletterName}
                      </Link>
                      <span className="text-muted-foreground/60">by</span>
                      <Link
                        href={`/@${issue.ownerUsername || "unknown"}`}
                        className="truncate text-foreground hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {issue.ownerName || issue.ownerUsername || "Unknown"}
                      </Link>
                    </div>
                  </div>

                  {/* Title */}
                  <Link
                    href={`/@${issue.ownerUsername || "unknown"}/${issue.newsletterSlug}/${issue.slug}`}
                    className="mt-4 block"
                  >
                    <h2 className="text-xl font-bold leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {issue.title || "Untitled"}
                    </h2>
                  </Link>

                  {/* Excerpt */}
                  {issue.excerpt && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {issue.excerpt}
                    </p>
                  )}

                  {/* Footer (read-only like) */}
                  <div className="mt-auto flex items-center justify-between pt-5 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 fill-foreground text-foreground" />
                      <span className="text-sm font-semibold text-foreground">0</span>
                    </div>
                    <time className="text-xs font-medium text-muted-foreground">
                      {formatDate(issue.publishedAt)}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}

