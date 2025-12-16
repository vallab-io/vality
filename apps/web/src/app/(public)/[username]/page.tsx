import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SubscribeForm } from "./_components/subscribe-form";
import { UserAvatar } from "@/components/common";

// 목업 사용자 데이터
const MOCK_USERS: Record<string, UserProfile> = {
  johndoe: {
    id: "clh1user001abc123def789",
    username: "johndoe",
    name: "John Doe",
    bio: "프로덕트 디자이너 · 스타트업에서 일하고 있습니다. 디자인, 생산성, 그리고 일하는 방식에 대해 씁니다.",
    imageUrl: null,
  },
  jane: {
    id: "clh1user002abc123def789",
    username: "jane",
    name: "Jane Kim",
    bio: "개발자 · 기술 블로거. 웹 개발, AI, 그리고 개발자의 삶에 대해 이야기합니다.",
    imageUrl: null,
  },
};

// 목업 뉴스레터 데이터 (유저별)
const MOCK_NEWSLETTERS: Record<string, Newsletter[]> = {
  johndoe: [
    {
      id: "clh1abc123def456ghi789",
      slug: "weekly",
      name: "John's Weekly",
      description: "매주 월요일, 디자인과 프로덕트에 대한 인사이트를 전달합니다.",
      subscriberCount: 1234,
    },
    {
      id: "clh1newsletter002abc123",
      slug: "design-tips",
      name: "Design Tips",
      description: "실무에서 바로 쓸 수 있는 디자인 팁을 공유합니다.",
      subscriberCount: 567,
    },
  ],
  jane: [
    {
      id: "clh1newsletter003abc123",
      slug: "tech-notes",
      name: "Tech Notes",
      description: "개발자를 위한 주간 기술 뉴스레터",
      subscriberCount: 890,
    },
  ],
};

// 목업 이슈 데이터 (유저별 전체 이슈 - 최신순)
const MOCK_ISSUES: Record<string, Issue[]> = {
  johndoe: [
    {
      id: "clh2issue001abc123def",
      slug: "design-trends-2025",
      title: "2025년 주목할 디자인 트렌드",
      excerpt:
        "새해를 맞아 올해 주목할 만한 디자인 트렌드를 정리해 보았습니다. AI 기반 디자인 도구부터 지속 가능한 디자인까지...",
      publishedAt: "2025-01-15",
      newsletterSlug: "weekly",
      newsletterName: "John's Weekly",
    },
    {
      id: "clh2issue002abc123def",
      slug: "productivity-tips",
      title: "디자이너를 위한 생산성 팁 10가지",
      excerpt:
        "바쁜 일상 속에서 효율적으로 일하는 방법. Figma 단축키부터 시간 관리 기법까지 실전에서 바로 쓸 수 있는 팁들.",
      publishedAt: "2025-01-08",
      newsletterSlug: "weekly",
      newsletterName: "John's Weekly",
    },
    {
      id: "clh2issue007abc123def",
      slug: "figma-component-guide",
      title: "Figma 컴포넌트 완벽 가이드",
      excerpt:
        "효율적인 컴포넌트 설계부터 베리언트 활용까지, Figma 컴포넌트의 모든 것을 다룹니다.",
      publishedAt: "2025-01-05",
      newsletterSlug: "design-tips",
      newsletterName: "Design Tips",
    },
    {
      id: "clh2issue003abc123def",
      slug: "remote-work-guide",
      title: "리모트 워크 3년차의 노하우",
      excerpt:
        "재택근무를 시작한 지 3년. 그동안 배운 것들과 효과적인 원격 협업 방법에 대해 공유합니다.",
      publishedAt: "2025-01-01",
      newsletterSlug: "weekly",
      newsletterName: "John's Weekly",
    },
    {
      id: "clh2issue004abc123def",
      slug: "year-in-review-2024",
      title: "2024년 회고: 성장과 변화의 한 해",
      excerpt:
        "한 해를 돌아보며 배운 것들, 실패한 것들, 그리고 새해 목표까지. 솔직한 회고록.",
      publishedAt: "2024-12-28",
      newsletterSlug: "weekly",
      newsletterName: "John's Weekly",
    },
  ],
  jane: [
    {
      id: "clh2issue008abc123def",
      slug: "nextjs-15-features",
      title: "Next.js 15 새로운 기능 정리",
      excerpt: "Next.js 15에서 추가된 새로운 기능들을 정리했습니다.",
      publishedAt: "2025-01-12",
      newsletterSlug: "tech-notes",
      newsletterName: "Tech Notes",
    },
  ],
};

interface UserProfile {
  id: string;
  username: string;
  name: string;
  bio: string;
  imageUrl: string | null;
}

interface Newsletter {
  id: string;
  slug: string;
  name: string;
  description: string;
  subscriberCount: number;
}

interface Issue {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  newsletterSlug: string;
  newsletterName: string;
}

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = MOCK_USERS[username];

  if (!user) {
    return { title: "사용자를 찾을 수 없습니다" };
  }

  return {
    title: `${user.name} (@${user.username})`,
    description: user.bio,
    openGraph: {
      title: `${user.name} (@${user.username})`,
      description: user.bio,
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = MOCK_USERS[username];
  const newsletters = MOCK_NEWSLETTERS[username] || [];
  const issues = MOCK_ISSUES[username] || [];

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
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
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

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* 1. User 자기 소개 */}
        <section className="flex flex-col items-center text-center">
          <UserAvatar
            name={user.name}
            imageUrl={user.imageUrl}
            size="lg"
            className="mb-4"
          />
          <h1 className="text-2xl font-semibold">{user.name}</h1>
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
                      username={username}
                      newsletterSlug={newsletter.slug}
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
                  </div>
                  <div className="mt-3">
                    <Link
                      href={`/@${username}/${issue.newsletterSlug}/${issue.slug}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      읽기 →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-6">
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
