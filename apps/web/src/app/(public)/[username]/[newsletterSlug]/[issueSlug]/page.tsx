import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserAvatar } from "@/components/common";
import { SubscribeForm } from "../../_components/subscribe-form";
import { ShareButtons } from "./_components/share-buttons";
import { IssueHeader } from "./_components/issue-header";
import { LikeButton } from "./_components/like-button";
import {
  getPublicIssueDetail,
  getPublicNewsletter,
  getPublicUserProfile,
} from "@/lib/api/public";

interface IssuePageProps {
  params: Promise<{ username: string; newsletterSlug: string; issueSlug: string }>;
}

export async function generateMetadata({
  params,
}: IssuePageProps): Promise<Metadata> {
  const { username, newsletterSlug, issueSlug } = await params;
  
  try {
    const issue = await getPublicIssueDetail(username, newsletterSlug, issueSlug);
    const user = await getPublicUserProfile(username);

    return {
      title: issue.title || "Untitled",
      description: issue.excerpt || issue.content.slice(0, 160).replace(/<[^>]*>/g, " ").trim(),
      openGraph: {
        title: issue.title || "Untitled",
        type: "article",
        authors: issue.ownerName ? [issue.ownerName] : undefined,
      },
    };
  } catch {
    return { title: "글을 찾을 수 없습니다" };
  }
}

export default async function IssuePage({ params }: IssuePageProps) {
  const { username, newsletterSlug, issueSlug } = await params;
  
  try {
    const [issue, newsletter, user] = await Promise.all([
      getPublicIssueDetail(username, newsletterSlug, issueSlug),
      getPublicNewsletter(username, newsletterSlug),
      getPublicUserProfile(username),
    ]);

    return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <IssueHeader 
        newsletterName={newsletter.name}
        username={username}
        newsletterSlug={newsletterSlug}
      />

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Article Header */}
        <header className="mb-10">
          <time className="text-sm text-muted-foreground">
            {formatDate(issue.publishedAt)}
          </time>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {issue.title || "Untitled"}
          </h1>

          {/* Author */}
          <div className="mt-6 flex items-center gap-3">
            <UserAvatar 
              name={issue.ownerName || issue.ownerUsername || ""} 
              imageUrl={issue.ownerImageUrl} 
              size="md" 
            />
            <div>
              <Link href={`/@${username}`} className="font-medium hover:underline">
                {issue.ownerName || issue.ownerUsername || username}
              </Link>
              <p className="text-sm text-muted-foreground">
                <Link href={`/@${username}/${newsletterSlug}`} className="hover:underline">
                  {issue.newsletterName}
                </Link>
              </p>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article 
          className="prose prose-neutral max-w-none dark:prose-invert [&_img]:mx-auto [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4"
          dangerouslySetInnerHTML={{ __html: issue.content }}
        />

        {/* Like & Share Buttons */}
        <div className="mt-10 flex items-center justify-between">
          <LikeButton issueId={issue.id} initialLikeCount={issue.likeCount || 0} />
          <ShareButtons title={issue.title || "Untitled"} />
        </div>

        {/* Subscribe CTA */}
        <div className="mx-auto mt-10 max-w-md rounded-xl border border-border bg-muted/30 p-6 text-center">
          <h2 className="text-lg font-semibold">{newsletter.name} 구독하기</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            새로운 글이 발행되면 이메일로 알려드립니다.
          </p>
          <div className="mt-4">
            <SubscribeForm newsletterId={newsletter.id} />
          </div>
        </div>

      </main>
    </div>
    );
  } catch (error) {
    console.error("Failed to load issue:", error);
    notFound();
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

