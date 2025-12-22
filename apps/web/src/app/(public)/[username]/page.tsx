import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SubscribeForm } from "./_components/subscribe-form";
import { UserAvatar } from "@/components/common";
import { ProfileHeader } from "./_components/profile-header";
import {
  getPublicUserProfile,
  getPublicUserNewsletters,
  getPublicUserIssues,
  type PublicUserProfile,
  type PublicNewsletter,
  type PublicIssue,
} from "@/lib/api/public";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  
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
    return { title: "사용자를 찾을 수 없습니다" };
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  
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
      return new Date(dateString).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ProfileHeader />

      <main className="mx-auto max-w-5xl px-6 py-16">
        {/* 1. User 자기 소개 */}
        <section className="flex flex-col items-center text-center">
          <UserAvatar
            name={user.name || user.username}
            imageUrl={user.imageUrl}
            size="lg"
            className="mb-4"
          />
          <h1 className="text-2xl font-semibold">{user.name || user.username}</h1>
          <p className="mt-1 text-sm text-muted-foreground">@{user.username}</p>
          {user.bio && (
            <p className="mt-4 max-w-lg text-muted-foreground">{user.bio}</p>
          )}
        </section>

        {/* 2. User가 가지고 있는 뉴스레터 소개 */}
        {newsletters.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold">뉴스레터</h2>
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
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {newsletter.description}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {newsletter.subscriberCount.toLocaleString()}명 구독 중
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
              <h2 className="text-lg font-semibold">최근 발행</h2>
              <span className="text-sm text-muted-foreground">
                {issues.length}개의 글
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {issues.map((issue) => (
                <article
                  key={issue.id}
                  className="group rounded-lg border border-border p-5 transition-colors hover:border-[#2563EB]/50 dark:hover:border-[#38BDF8]/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded bg-muted px-1.5 py-0.5">
                          {issue.newsletterName}
                        </span>
                        <span>·</span>
                        <time>{formatDate(issue.publishedAt)}</time>
                      </div>
                      <Link
                        href={`/@${username}/${issue.newsletterSlug}/${issue.slug}`}
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
                        href={`/@${username}/${issue.newsletterSlug}/${issue.slug}`}
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
          </section>
        )}
      </main>
    </div>
  );
  } catch (error) {
    notFound();
  }
}
