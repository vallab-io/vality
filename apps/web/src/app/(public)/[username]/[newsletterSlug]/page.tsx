import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Vality
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            로그인
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
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
        <section className="mt-8 rounded-xl border border-border bg-muted/30 p-6">
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
            <div className="mt-6 divide-y divide-border">
              {issues.map((issue) => (
                <article key={issue.id} className="py-6 first:pt-0 last:pb-0">
                  <time className="text-sm text-muted-foreground">
                    {formatDate(issue.publishedAt)}
                  </time>
                  <Link href={`/@${username}/${newsletterSlug}/${issue.slug}`}>
                    <h3 className="mt-2 text-lg font-semibold hover:underline">
                      {issue.title}
                    </h3>
                  </Link>
                  {issue.excerpt && (
                    <p className="mt-2 text-muted-foreground line-clamp-2">
                      {issue.excerpt}
                    </p>
                  )}
                  <Link
                    href={`/@${username}/${newsletterSlug}/${issue.slug}`}
                    className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    읽기 →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-2xl px-6 py-6">
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
  } catch (error) {
    notFound();
  }
}

