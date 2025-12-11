import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SubscribeForm } from "../_components/subscribe-form";
import { UserAvatar } from "@/components/common";

// 목업 사용자 데이터
const MOCK_USERS: Record<string, UserProfile> = {
  johndoe: {
    id: "clh1user001abc123def789",
    username: "johndoe",
    name: "John Doe",
    avatarUrl: null,
  },
  jane: {
    id: "clh1user002abc123def789",
    username: "jane",
    name: "Jane Kim",
    avatarUrl: null,
  },
};

// 목업 뉴스레터 데이터 (username -> newsletterSlug -> Newsletter)
const MOCK_NEWSLETTERS: Record<string, Record<string, Newsletter>> = {
  johndoe: {
    weekly: {
      id: "clh1abc123def456ghi789",
      slug: "weekly",
      name: "John's Weekly",
      description:
        "매주 월요일, 디자인과 프로덕트에 대한 인사이트를 전달합니다. UI/UX 트렌드부터 실무 팁까지 다양한 주제를 다룹니다.",
      subscriberCount: 1234,
    },
    "design-tips": {
      id: "clh1newsletter002abc123",
      slug: "design-tips",
      name: "Design Tips",
      description:
        "실무에서 바로 쓸 수 있는 디자인 팁을 공유합니다. Figma, Framer 등 다양한 도구 활용법을 알려드립니다.",
      subscriberCount: 567,
    },
  },
  jane: {
    "tech-notes": {
      id: "clh1newsletter003abc123",
      slug: "tech-notes",
      name: "Tech Notes",
      description: "개발자를 위한 주간 기술 뉴스레터. 최신 웹 기술과 트렌드를 정리해 전달합니다.",
      subscriberCount: 890,
    },
  },
};

// 목업 이슈 데이터 (username -> newsletterSlug -> Issue[])
const MOCK_ISSUES: Record<string, Record<string, Issue[]>> = {
  johndoe: {
    weekly: [
      {
        id: "clh2issue001abc123def",
        slug: "design-trends-2025",
        title: "2025년 주목할 디자인 트렌드",
        excerpt:
          "새해를 맞아 올해 주목할 만한 디자인 트렌드를 정리해 보았습니다. AI 기반 디자인 도구부터 지속 가능한 디자인까지...",
        publishedAt: "2025-01-15",
      },
      {
        id: "clh2issue002abc123def",
        slug: "productivity-tips",
        title: "디자이너를 위한 생산성 팁 10가지",
        excerpt:
          "바쁜 일상 속에서 효율적으로 일하는 방법. Figma 단축키부터 시간 관리 기법까지 실전에서 바로 쓸 수 있는 팁들.",
        publishedAt: "2025-01-08",
      },
      {
        id: "clh2issue003abc123def",
        slug: "remote-work-guide",
        title: "리모트 워크 3년차의 노하우",
        excerpt:
          "재택근무를 시작한 지 3년. 그동안 배운 것들과 효과적인 원격 협업 방법에 대해 공유합니다.",
        publishedAt: "2025-01-01",
      },
      {
        id: "clh2issue004abc123def",
        slug: "year-in-review-2024",
        title: "2024년 회고: 성장과 변화의 한 해",
        excerpt:
          "한 해를 돌아보며 배운 것들, 실패한 것들, 그리고 새해 목표까지. 솔직한 회고록.",
        publishedAt: "2024-12-28",
      },
      {
        id: "clh2issue005abc123def",
        slug: "design-system-basics",
        title: "디자인 시스템 구축 가이드",
        excerpt:
          "효율적인 디자인 시스템을 처음부터 구축하는 방법. 컴포넌트 설계부터 문서화까지 단계별로 설명합니다.",
        publishedAt: "2024-12-20",
      },
    ],
    "design-tips": [
      {
        id: "clh2issue007abc123def",
        slug: "figma-component-guide",
        title: "Figma 컴포넌트 완벽 가이드",
        excerpt:
          "효율적인 컴포넌트 설계부터 베리언트 활용까지, Figma 컴포넌트의 모든 것을 다룹니다.",
        publishedAt: "2025-01-05",
      },
      {
        id: "clh2issue008abc123def",
        slug: "auto-layout-mastery",
        title: "오토 레이아웃 마스터하기",
        excerpt:
          "복잡한 레이아웃도 쉽게 만드는 오토 레이아웃 활용법. 실전 예제와 함께 배워봅니다.",
        publishedAt: "2024-12-15",
      },
    ],
  },
  jane: {
    "tech-notes": [
      {
        id: "clh2issue009abc123def",
        slug: "nextjs-15-features",
        title: "Next.js 15 새로운 기능 정리",
        excerpt: "Next.js 15에서 추가된 새로운 기능들을 정리했습니다.",
        publishedAt: "2025-01-12",
      },
    ],
  },
};

interface UserProfile {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
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
}

interface NewsletterPageProps {
  params: Promise<{ username: string; newsletterSlug: string }>;
}

export async function generateMetadata({
  params,
}: NewsletterPageProps): Promise<Metadata> {
  const { username, newsletterSlug } = await params;
  const user = MOCK_USERS[username];
  const newsletter = MOCK_NEWSLETTERS[username]?.[newsletterSlug];

  if (!user || !newsletter) {
    return { title: "뉴스레터를 찾을 수 없습니다" };
  }

  return {
    title: `${newsletter.name} - ${user.name}`,
    description: newsletter.description,
    openGraph: {
      title: `${newsletter.name} by ${user.name}`,
      description: newsletter.description,
    },
  };
}

export default async function NewsletterPage({ params }: NewsletterPageProps) {
  const { username, newsletterSlug } = await params;
  const user = MOCK_USERS[username];
  const newsletter = MOCK_NEWSLETTERS[username]?.[newsletterSlug];
  const issues = MOCK_ISSUES[username]?.[newsletterSlug] || [];

  if (!user || !newsletter) {
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
            <UserAvatar name={user.name} imageUrl={user.avatarUrl} size="sm" />
            <span>{user.name}</span>
          </Link>
          <h1 className="mt-4 text-3xl font-bold">{newsletter.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {newsletter.description}
          </p>
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
            <SubscribeForm username={username} newsletterSlug={newsletterSlug} />
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
                  <p className="mt-2 text-muted-foreground line-clamp-2">
                    {issue.excerpt}
                  </p>
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
}

