import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SubscribeForm } from "./_components/subscribe-form";
import { UserAvatar } from "@/components/common";
import {
  getPublicUserProfile,
  getPublicUserNewsletters,
  getPublicUserIssues,
  type PublicUserProfile,
  type PublicNewsletter,
  type PublicIssue,
} from "@/lib/api/public";
import { getTranslation } from "@/lib/i18n/utils";
import { getLocaleFromCookieServer } from "@/lib/i18n/utils-server";
import { formatRelativeTime } from "@/lib/utils/date";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const locale = await getLocaleFromCookieServer();
  
  try {
    const user = await getPublicUserProfile(username);
    return {
      title: `${user.name || user.username} (@${user.username})`,
      description: user.bio || undefined,
      openGraph: {
        title: `${user.name || user.username} (@${user.username})`,
        description: user.bio || undefined,
      },
    };
  } catch (error) {
    return { title: getTranslation(locale, "public.userNotFound") };
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const locale = await getLocaleFromCookieServer();
  const t = (key: string) => getTranslation(locale, key);
  
  try {
    const [user, newsletters, issues] = await Promise.all([
      getPublicUserProfile(username),
      getPublicUserNewsletters(username),
      getPublicUserIssues(username, { limit: 20, offset: 0 }),
    ]);

    if (!user) {
      notFound();
    }

    const formatDate = (dateString: string) => {
      return formatRelativeTime(dateString, locale);
    };

  return (
    <>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-16">
        {/* 1. User 자기 소개 */}
        <section className="flex flex-col items-center text-center">
          <UserAvatar
            name={user.name || user.username}
            imageUrl={user.imageUrl}
            size="lg"
            className="mb-4"
          />
          <h1 className="text-xl sm:text-2xl font-semibold">{user.name || user.username}</h1>
          <p className="mt-1 text-sm text-muted-foreground">@{user.username}</p>
          {user.bio && (
            <p className="mt-4 max-w-lg text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">{user.bio}</p>
          )}
        </section>

        {/* 2. User가 가지고 있는 뉴스레터 소개 */}
        {newsletters.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold">{t("public.newsletters")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {newsletters.map((newsletter) => (
                <div
                  key={newsletter.id}
                  className="rounded-xl border border-border p-5 transition-colors hover:border-[#2563EB]/50 dark:hover:border-[#38BDF8]/50"
                >
                  <Link href={`/@${username}/${newsletter.slug}`}>
                    <h3 className="font-semibold hover:underline">
                      {newsletter.name}
                    </h3>
                  </Link>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                    {newsletter.description}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {newsletter.subscriberCount.toLocaleString()} {t("public.subscribersCount")}
                  </p>
                  <div className="mt-4">
                    <SubscribeForm
                      newsletterId={newsletter.id}
                      compact
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. 최신 발행한 뉴스레터 이슈 */}
        {issues.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("public.recentIssues")}</h2>
              <span className="text-sm text-muted-foreground">
                {issues.length} {t("public.articlesCount")}
              </span>
            </div>
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
                        href={`/@${username}/${issue.newsletterSlug}/${issue.slug}`}
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
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="rounded bg-muted px-1.5 py-0.5">
                          {issue.newsletterName}
                        </span>
                        <span>·</span>
                        <time>{formatDate(issue.publishedAt)}</time>
                      </div>
                      <Link
                        href={`/@${username}/${issue.newsletterSlug}/${issue.slug}`}
                      >
                        <h3 className="mt-2 text-lg font-semibold group-hover:underline leading-snug">
                          {issue.title}
                        </h3>
                      </Link>
                      {issue.description && (
                        <p className="mt-2 text-base text-muted-foreground line-clamp-2 leading-relaxed">
                          {issue.description}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
  } catch (error) {
    notFound();
  }
}
