import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SubscribeForm } from "../_components/subscribe-form";
import { UserAvatar } from "@/components/common";
import {
  getPublicUserProfile,
  getPublicNewsletter,
  getPublicNewsletterIssues,
  type PublicUserProfile,
  type PublicNewsletter,
  type PublicIssue,
} from "@/lib/api/public";

interface NewsletterPageProps {
  params: Promise<{ username: string; newsletterSlug: string }>;
}

export async function generateMetadata({
  params,
}: NewsletterPageProps): Promise<Metadata> {
  const { username, newsletterSlug } = await params;

  try {
    const [user, newsletter] = await Promise.all([
      getPublicUserProfile(username),
      getPublicNewsletter(username, newsletterSlug),
    ]);

    return {
      title: `${newsletter.name} - ${user.name || user.username}`,
      description: newsletter.description || undefined,
      openGraph: {
        title: `${newsletter.name} by ${user.name || user.username}`,
        description: newsletter.description || undefined,
      },
    };
  } catch (error) {
    return { title: "뉴스레터를 찾을 수 없습니다" };
  }
}

export default async function NewsletterPage({ params }: NewsletterPageProps) {
  const { username, newsletterSlug } = await params;

  try {
    const [user, newsletter, issues] = await Promise.all([
      getPublicUserProfile(username),
      getPublicNewsletter(username, newsletterSlug),
      getPublicNewsletterIssues(username, newsletterSlug),
    ]);

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

  return (
    <>
      <main className="mx-auto max-w-5xl px-6 py-16">
        {/* 1. 뉴스레터 소개 */}
        <section className="text-center">
          <Link
            href={`/@${username}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <UserAvatar
              name={user.name || user.username}
              imageUrl={user.imageUrl}
              size="sm"
            />
            <span>{user.name || user.username}</span>
          </Link>
          <h1 className="mt-4 text-3xl font-bold">{newsletter.name}</h1>
          {newsletter.description && (
            <p className="mt-4 text-lg text-muted-foreground">
              {newsletter.description}
            </p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {newsletter.subscriberCount.toLocaleString()}명이 구독 중
          </p>
        </section>

        {/* 2. 구독 화면 */}
        <section className="mx-auto mt-8 max-w-md rounded-xl border border-border bg-muted/30 p-6">
          <h2 className="text-center font-semibold">뉴스레터 구독하기</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            새로운 글이 발행되면 이메일로 알려드립니다.
          </p>
          <div className="mt-4">
            <SubscribeForm newsletterId={newsletter.id} />
          </div>
        </section>

        {/* 3. 발행한 이슈 전부 */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">발행된 글</h2>
            <span className="text-sm text-muted-foreground">
              {issues.length}개의 글
            </span>
          </div>

          {issues.length === 0 ? (
            <div className="mt-6 rounded-lg border border-border py-12 text-center">
              <p className="text-muted-foreground">아직 발행된 글이 없습니다.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {issues.map((issue) => (
                <article
                  key={issue.id}
                  className="group rounded-lg border border-border p-5 transition-colors hover:border-[#2563EB]/50 dark:hover:border-[#38BDF8]/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <time>{formatDate(issue.publishedAt)}</time>
                      </div>
                      <Link
                        href={`/@${username}/${newsletterSlug}/${issue.slug}`}
                      >
                        <h3 className="mt-2 font-semibold group-hover:underline">
                          {issue.title}
                        </h3>
                      </Link>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {issue.excerpt}
                      </p>
                    </div>
                    {issue.coverImageUrl && (
                      <Link
                        href={`/@${username}/${newsletterSlug}/${issue.slug}`}
                        className="flex-shrink-0"
                      >
                        <div className="relative h-24 w-32 overflow-hidden rounded-lg bg-muted/50 border border-border/60">
                          <Image
                            src={issue.coverImageUrl}
                            alt={issue.title || "cover image"}
                            fill
                            sizes="128px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
    );
  } catch (error) {
    notFound();
  }
}

