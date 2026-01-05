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
import { getTranslation } from "@/lib/i18n/utils";
import { getLocaleFromCookieServer } from "@/lib/i18n/utils-server";
import { formatRelativeTime } from "@/lib/utils/date";
import type { Locale } from "@/lib/i18n/locales/types";

interface NewsletterPageProps {
  params: Promise<{ username: string; newsletterSlug: string }>;
}

export async function generateMetadata({
  params,
}: NewsletterPageProps): Promise<Metadata> {
  const { username, newsletterSlug } = await params;
  const locale = await getLocaleFromCookieServer();

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
    return { title: getTranslation(locale, "public.newsletterNotFound") };
  }
}

export default async function NewsletterPage({ params }: NewsletterPageProps) {
  const { username, newsletterSlug } = await params;
  const locale = (await getLocaleFromCookieServer()) as Locale;
  const t = (key: string) => getTranslation(locale, key);

  try {
    const [user, newsletter, issues] = await Promise.all([
      getPublicUserProfile(username),
      getPublicNewsletter(username, newsletterSlug),
      getPublicNewsletterIssues(username, newsletterSlug),
    ]);

    const formatDateLocal = (dateString: string) => {
      return formatRelativeTime(dateString, locale);
    };

  return (
    <>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-16">
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
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold">{newsletter.name}</h1>
          {newsletter.description && (
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              {newsletter.description}
            </p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {newsletter.subscriberCount.toLocaleString()} {t("public.subscribersCount")}
          </p>
        </section>

        {/* 2. 구독 화면 */}
        <section className="mx-auto mt-8 max-w-md rounded-xl border border-border bg-muted/30 p-6">
          <h2 className="text-center font-semibold">{t("public.subscribeToNewsletter").replace("{name}", newsletter.name)}</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t("public.subscribeDesc")}
          </p>
          <div className="mt-4">
            <SubscribeForm newsletterId={newsletter.id} />
          </div>
        </section>

        {/* 3. 발행한 이슈 전부 */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("public.publishedArticles")}</h2>
            <span className="text-sm text-muted-foreground">
              {issues.length} {t("public.articlesCount")}
            </span>
          </div>

          {issues.length === 0 ? (
            <div className="mt-6 rounded-lg border border-border py-12 text-center">
              <p className="text-muted-foreground">{t("public.noPublishedArticles")}</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {issues.map((issue) => (
                <article
                  key={issue.id}
                  className="group rounded-lg border border-border p-4 sm:p-5 transition-colors hover:border-[#2563EB]/50 dark:hover:border-[#38BDF8]/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    {/* Mobile: Image first */}
                    {issue.coverImageUrl && (
                      <Link
                        href={`/@${username}/${newsletterSlug}/${issue.slug}`}
                        className="flex-shrink-0 sm:order-2"
                      >
                        <div className="relative h-40 w-full sm:h-24 sm:w-32 overflow-hidden rounded-lg bg-muted/50 border border-border/60">
                          <Image
                            src={issue.coverImageUrl}
                            alt={issue.title || t("public.coverImage")}
                            fill
                            sizes="(max-width: 640px) 100vw, 128px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </Link>
                    )}
                    <div className="min-w-0 flex-1 sm:order-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <time>{formatDateLocal(issue.publishedAt)}</time>
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
    console.error("NewsletterPage error:", error);
    // API 호출 실패 시 404 반환
    notFound();
  }
}
