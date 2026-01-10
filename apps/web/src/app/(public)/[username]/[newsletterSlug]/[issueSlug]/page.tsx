import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserAvatar } from "@/components/common";
import { SubscribeForm } from "../../_components/subscribe-form";
import { ShareButtons } from "./_components/share-buttons";
import { LikeButton } from "./_components/like-button";
import {
  getPublicIssueDetail,
  getPublicNewsletter,
  getPublicUserProfile,
} from "@/lib/api/public";
import { getTranslation } from "@/lib/i18n/utils";
import { getLocaleFromCookieServer } from "@/lib/i18n/utils-server";
import { formatRelativeTime } from "@/lib/utils/date";

interface IssuePageProps {
  params: Promise<{ username: string; newsletterSlug: string; issueSlug: string }>;
}

export async function generateMetadata({
  params,
}: IssuePageProps): Promise<Metadata> {
  const { username, newsletterSlug, issueSlug } = await params;
  const locale = await getLocaleFromCookieServer();
  
  try {
    const issue = await getPublicIssueDetail(username, newsletterSlug, issueSlug);
    const user = await getPublicUserProfile(username);

    return {
      title: issue.title || getTranslation(locale, "common.untitled"),
      description: issue.excerpt || issue.content.slice(0, 160).replace(/<[^>]*>/g, " ").trim(),
      openGraph: {
        title: issue.title || getTranslation(locale, "common.untitled"),
        type: "article",
        authors: issue.ownerName ? [issue.ownerName] : undefined,
      },
    };
  } catch {
    return { title: getTranslation(locale, "public.articleNotFound") };
  }
}

export default async function IssuePage({ params }: IssuePageProps) {
  const { username, newsletterSlug, issueSlug } = await params;
  const locale = await getLocaleFromCookieServer();
  const t = (key: string) => getTranslation(locale, key);
  
  try {
    const [issue, newsletter, user] = await Promise.all([
      getPublicIssueDetail(username, newsletterSlug, issueSlug),
      getPublicNewsletter(username, newsletterSlug),
      getPublicUserProfile(username),
    ]);

    const formatDateLocal = (dateString: string): string => {
      if (!dateString) return "";
      return formatRelativeTime(dateString, locale);
    };

    return (
    <>
      {/* Newsletter Header - Hidden on mobile since HomeSidebar handles it */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 hidden md:block">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex h-16 items-center">
            <Link
              href={`/@${username}/${newsletterSlug}`}
              className="text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              {newsletter.name}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-12">
        {/* Article Header */}
        <header className="mb-8 sm:mb-12">
          <time className="text-base text-muted-foreground">
            {formatDateLocal(issue.publishedAt)}
          </time>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            {issue.title || t("common.untitled")}
          </h1>

          {/* Author */}
          <div className="mt-6 sm:mt-8 flex items-center gap-3">
            <UserAvatar 
              name={issue.ownerName || issue.ownerUsername || ""} 
              imageUrl={issue.ownerImageUrl} 
              size="md" 
            />
            <div>
              <Link href={`/@${username}`} className="text-base font-medium hover:underline">
                {issue.ownerName || issue.ownerUsername || username}
              </Link>
              <p className="text-sm text-muted-foreground mt-0.5">
                <Link href={`/@${username}/${newsletterSlug}`} className="hover:underline">
                  {issue.newsletterName}
                </Link>
              </p>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article 
          className="prose prose-lg sm:prose-xl prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-p:text-foreground [&_p]:text-lg [&_p]:sm:text-xl [&_p]:leading-8 [&_li]:text-lg [&_li]:sm:text-xl [&_li]:leading-8 [&_img]:mx-auto [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-6 [&_h1]:text-3xl [&_h1]:sm:text-4xl [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h3]:text-xl [&_h3]:sm:text-2xl"
          dangerouslySetInnerHTML={{ __html: issue.content }}
        />

        {/* Like & Share Buttons */}
        <div className="mt-8 sm:mt-10 flex items-center justify-between">
          <LikeButton issueId={issue.id} initialLikeCount={issue.likeCount || 0} />
          <ShareButtons title={issue.title || t("common.untitled")} />
        </div>

        {/* Subscribe CTA */}
        <div className="mx-auto mt-8 sm:mt-10 max-w-md rounded-xl border border-border bg-muted/30 p-4 sm:p-6 text-center">
          <h2 className="text-base sm:text-lg font-semibold">{t("public.subscribeToNewsletter").replace("{name}", newsletter.name)}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("public.subscribeDesc")}
          </p>
          <div className="mt-4">
            <SubscribeForm newsletterId={newsletter.id} />
          </div>
        </div>

      </main>
    </>
    );
  } catch (error) {
    console.error("Failed to load issue:", error);
    notFound();
  }
}
