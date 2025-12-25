"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { HomeSidebar } from "./home-sidebar";
import { getAllPublicIssues, type PublicIssue } from "@/lib/api/public";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/auth.store";
import { Heart } from "lucide-react";

export default function HomePageContent() {
  const user = useAtomValue(userAtom);
  const [issues, setIssues] = useState<PublicIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // 성능 측정 오류 방지를 위해 transition 사용
    startTransition(async () => {
      try {
        // 모든 사용자의 발행된 이슈들 가져오기
        const allIssues = await getAllPublicIssues(50, 0);
        setIssues(allIssues);
      } catch (error) {
        console.error("Failed to load issues:", error);
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

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
      <div className="min-h-screen bg-background">
        <HomeSidebar />
        <div className="ml-64 flex min-h-screen items-center justify-center">
          <div className="text-muted-foreground">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HomeSidebar />
      
      <main className="ml-64 min-h-screen">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Issues List */}
          {issues.length === 0 ? (
            <div className="mt-12 rounded-xl border border-border bg-card py-20 text-center shadow-sm">
              <p className="text-muted-foreground text-lg font-medium">아직 발행된 이슈가 없습니다.</p>
              {user && (
                <Link
                  href="/dashboard"
                  className="mt-4 inline-block text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  첫 번째 이슈 작성하기 →
                </Link>
              )}
            </div>
          ) : (
            <div>
              {/* Section Header */}
              <div className="mb-8 pb-4 border-b border-border/50">
                <h2 className="text-lg font-semibold text-foreground">For you</h2>
              </div>

              <div className="space-y-6">
                {issues.map((issue) => (
                  <article
                    key={issue.id}
                    className="group flex gap-6 p-6 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                  >
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                  {/* Author Info */}
                  <div className="flex items-center gap-2 mb-2">
                    {issue.ownerImageUrl ? (
                      <Link
                        href={`/@${issue.ownerUsername || "unknown"}`}
                        className="flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Image
                          src={issue.ownerImageUrl}
                          alt={issue.ownerName || issue.ownerUsername || "User"}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      </Link>
                    ) : (
                      <div className="h-5 w-5 flex-shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20" />
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Link
                        href={`/@${issue.ownerUsername || "unknown"}/${issue.newsletterSlug}`}
                        className="hover:text-foreground transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {issue.newsletterName}
                      </Link>
                      <span>·</span>
                      <Link
                        href={`/@${issue.ownerUsername || "unknown"}`}
                        className="hover:text-foreground transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {issue.ownerName || issue.ownerUsername || "Unknown"}
                      </Link>
                    </div>
                  </div>

                  {/* Title */}
                  <Link
                    href={`/@${issue.ownerUsername || "unknown"}/${issue.newsletterSlug}/${issue.slug}`}
                    className="block"
                  >
                    <h2 className="text-xl font-bold leading-snug text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {issue.title || "Untitled"}
                    </h2>
                  </Link>

                  {/* Excerpt */}
                  {issue.excerpt && (
                    <p className="text-sm leading-relaxed text-muted-foreground mb-3 line-clamp-2">
                      {issue.excerpt}
                    </p>
                  )}

                    {/* Footer */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                      <time>{formatDate(issue.publishedAt)}</time>
                      <span>·</span>
                      <div className="flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5" />
                        <span>{issue.likeCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail - 오른쪽, coverImageUrl이 있을 때만 표시 */}
                  {issue.coverImageUrl && (
                    <Link
                      href={`/@${issue.ownerUsername || "unknown"}/${issue.newsletterSlug}/${issue.slug}`}
                      className="flex-shrink-0"
                    >
                      <div className="relative h-40 w-40 overflow-hidden rounded-lg bg-gradient-to-br from-muted/60 to-muted/40 ring-1 ring-border/50">
                        <Image
                          src={issue.coverImageUrl}
                          alt={issue.newsletterName}
                          fill
                          sizes="160px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          priority={false}
                        />
                      </div>
                    </Link>
                  )}
                </article>
              ))}
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}

