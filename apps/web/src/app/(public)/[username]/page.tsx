import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SubscribeForm } from "./_components/subscribe-form";
import { NewsletterList } from "./_components/newsletter-list";
import { UserAvatar } from "@/components/common";

// 목업 사용자 데이터
const MOCK_USERS: Record<string, UserProfile> = {
  johndoe: {
    username: "johndoe",
    name: "John Doe",
    bio: "프로덕트 디자이너 · 스타트업에서 일하고 있습니다. 디자인, 생산성, 그리고 일하는 방식에 대해 씁니다.",
    avatarUrl: null,
    newsletterName: "John's Weekly",
    newsletterDescription:
      "매주 월요일, 디자인과 프로덕트에 대한 인사이트를 전달합니다.",
    subscriberCount: 1234,
  },
  jane: {
    username: "jane",
    name: "Jane Kim",
    bio: "개발자 · 기술 블로거. 웹 개발, AI, 그리고 개발자의 삶에 대해 이야기합니다.",
    avatarUrl: null,
    newsletterName: "Tech Notes",
    newsletterDescription: "개발자를 위한 주간 기술 뉴스레터",
    subscriberCount: 567,
  },
};

// 목업 뉴스레터 데이터
const MOCK_NEWSLETTERS = [
  {
    id: "1",
    slug: "design-trends-2025",
    title: "2025년 주목할 디자인 트렌드",
    excerpt:
      "새해를 맞아 올해 주목할 만한 디자인 트렌드를 정리해 보았습니다. AI 기반 디자인 도구부터 지속 가능한 디자인까지...",
    publishedAt: "2025-01-15",
  },
  {
    id: "2",
    slug: "productivity-tips",
    title: "디자이너를 위한 생산성 팁 10가지",
    excerpt:
      "바쁜 일상 속에서 효율적으로 일하는 방법. Figma 단축키부터 시간 관리 기법까지 실전에서 바로 쓸 수 있는 팁들.",
    publishedAt: "2025-01-08",
  },
  {
    id: "3",
    slug: "remote-work-guide",
    title: "리모트 워크 3년차의 노하우",
    excerpt:
      "재택근무를 시작한 지 3년. 그동안 배운 것들과 효과적인 원격 협업 방법에 대해 공유합니다.",
    publishedAt: "2025-01-01",
  },
  {
    id: "4",
    slug: "year-in-review-2024",
    title: "2024년 회고: 성장과 변화의 한 해",
    excerpt:
      "한 해를 돌아보며 배운 것들, 실패한 것들, 그리고 새해 목표까지. 솔직한 회고록.",
    publishedAt: "2024-12-28",
  },
  {
    id: "5",
    slug: "design-system-basics",
    title: "디자인 시스템 구축 가이드",
    excerpt:
      "효율적인 디자인 시스템을 처음부터 구축하는 방법. 컴포넌트 설계부터 문서화까지 단계별로 설명합니다.",
    publishedAt: "2024-12-20",
  },
  {
    id: "6",
    slug: "figma-tips-advanced",
    title: "Figma 고급 활용법",
    excerpt:
      "Figma를 더 효율적으로 사용하기 위한 고급 팁들. 컴포넌트, 오토 레이아웃, 프로토타이핑의 숨겨진 기능들.",
    publishedAt: "2024-12-15",
  },
];

interface UserProfile {
  username: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  newsletterName: string;
  newsletterDescription: string;
  subscriberCount: number;
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
      title: `${user.name} - ${user.newsletterName}`,
      description: user.newsletterDescription,
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = MOCK_USERS[username];

  if (!user) {
    notFound();
  }

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
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          <UserAvatar
            name={user.name}
            imageUrl={user.avatarUrl}
            size="lg"
            className="mb-4"
          />
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">@{user.username}</p>
          {user.bio && (
            <p className="mt-4 max-w-md text-muted-foreground">{user.bio}</p>
          )}
        </div>

        {/* Newsletter Info */}
        <div className="mt-10 rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold">{user.newsletterName}</h2>
          <p className="mt-2 text-muted-foreground">
            {user.newsletterDescription}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {user.subscriberCount.toLocaleString()}명이 구독 중
          </p>

          {/* Subscribe Form */}
          <div className="mt-6">
            <SubscribeForm username={user.username} />
          </div>
        </div>

        {/* All Newsletters */}
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">뉴스레터</h2>
            <span className="text-sm text-muted-foreground">
              {MOCK_NEWSLETTERS.length}개의 글
            </span>
          </div>
          <div className="mt-6">
            <NewsletterList
              newsletters={MOCK_NEWSLETTERS}
              username={user.username}
            />
          </div>
        </div>
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

