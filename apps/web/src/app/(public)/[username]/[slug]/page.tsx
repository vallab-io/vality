import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common";
import { SubscribeForm } from "../_components/subscribe-form";
import { ShareButtons } from "./_components/share-buttons";

// 목업 사용자 데이터
const MOCK_USERS: Record<string, { name: string; avatarUrl: string | null }> = {
  johndoe: { name: "John Doe", avatarUrl: null },
  jane: { name: "Jane Kim", avatarUrl: null },
};

// 목업 뉴스레터 데이터
const MOCK_NEWSLETTERS: Record<
  string,
  {
    id: string;
    slug: string;
    title: string;
    content: string;
    publishedAt: string;
    author: string;
  }
> = {
  "design-trends-2025": {
    id: "1",
    slug: "design-trends-2025",
    title: "2025년 주목할 디자인 트렌드",
    publishedAt: "2025-01-15",
    author: "johndoe",
    content: `
새해를 맞아 올해 주목할 만한 디자인 트렌드를 정리해 보았습니다.

## 1. AI 기반 디자인 도구의 성숙

작년에 이어 올해도 AI 디자인 도구는 계속 발전할 것입니다. 하지만 단순히 이미지를 생성하는 것을 넘어, 디자인 시스템을 이해하고 일관된 결과물을 만들어내는 방향으로 진화하고 있습니다.

Figma의 AI 기능, Adobe Firefly의 발전, 그리고 새로운 스타트업들의 등장까지. 디자이너의 역할이 변하고 있습니다.

## 2. 지속 가능한 디자인

환경을 고려한 디자인이 더 이상 선택이 아닌 필수가 되고 있습니다.

- **다크 모드 기본 지원**: 에너지 소비 절감
- **가벼운 웹 페이지**: 데이터 전송량 최소화
- **지속 가능한 패키징 디자인**: 물리적 제품 디자인에서도 중요

## 3. 마이크로 인터랙션의 진화

사용자 경험을 향상시키는 작은 애니메이션들이 더욱 정교해지고 있습니다. 로딩 상태, 버튼 피드백, 페이지 전환 등에서 섬세한 모션이 차별화 요소가 됩니다.

## 4. 접근성 우선 디자인

접근성은 더 이상 체크리스트 항목이 아닙니다. 처음부터 모든 사용자를 고려한 디자인이 기본이 되고 있습니다.

색상 대비, 키보드 네비게이션, 스크린 리더 지원 등을 처음부터 고려하세요.

## 마무리

트렌드를 따라가는 것도 중요하지만, 사용자에게 진정한 가치를 제공하는 것이 더 중요합니다. 
새로운 기술과 방법론을 탐구하되, 항상 "이것이 사용자에게 도움이 되는가?"를 먼저 생각해보세요.

다음 주에는 실제로 이런 트렌드를 적용한 사례들을 살펴보겠습니다.

읽어주셔서 감사합니다! 🙏
    `,
  },
  "productivity-tips": {
    id: "2",
    slug: "productivity-tips",
    title: "디자이너를 위한 생산성 팁 10가지",
    publishedAt: "2025-01-08",
    author: "johndoe",
    content: `
바쁜 일상 속에서 효율적으로 일하는 방법을 공유합니다.

## 1. Figma 단축키 마스터하기

가장 자주 쓰는 단축키 5개만 외워도 작업 속도가 2배가 됩니다.

- **Cmd + D**: 복제
- **Cmd + G**: 그룹화
- **Cmd + Shift + K**: 이미지 삽입
- **K**: 스케일 도구
- **Shift + A**: 오토 레이아웃

## 2. 디자인 시스템 구축

반복되는 컴포넌트를 시스템화하세요. 처음에는 시간이 걸리지만, 장기적으로 엄청난 시간을 절약할 수 있습니다.

## 3. 타임 블로킹

디자인 작업을 위한 방해받지 않는 시간을 확보하세요. 2시간 블록이 15분 조각 8개보다 훨씬 효과적입니다.

## 4. 피드백 구조화

"이거 어때요?"보다 구체적인 질문을 하세요. "이 버튼 색상이 CTA로서 충분히 눈에 띄나요?"처럼요.

## 5. 플러그인 활용

반복 작업을 자동화하는 플러그인을 찾아보세요. Content Reel, Unsplash, Iconify 등은 필수입니다.

나머지 5가지는 다음 뉴스레터에서 이어서 다루겠습니다!
    `,
  },
};

// 이전/다음 글 목록
const NEWSLETTER_ORDER = ["design-trends-2025", "productivity-tips"];

interface NewsletterPageProps {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: NewsletterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const newsletter = MOCK_NEWSLETTERS[slug];

  if (!newsletter) {
    return { title: "뉴스레터를 찾을 수 없습니다" };
  }

  const author = MOCK_USERS[newsletter.author];

  return {
    title: newsletter.title,
    description: newsletter.content.slice(0, 160).replace(/[#\n]/g, " ").trim(),
    openGraph: {
      title: newsletter.title,
      type: "article",
      authors: author ? [author.name] : undefined,
    },
  };
}

export default async function NewsletterPage({ params }: NewsletterPageProps) {
  const { username, slug } = await params;
  const newsletter = MOCK_NEWSLETTERS[slug];
  const user = MOCK_USERS[username];

  if (!newsletter || !user || newsletter.author !== username) {
    notFound();
  }

  // 이전/다음 글 찾기
  const currentIndex = NEWSLETTER_ORDER.indexOf(slug);
  const prevSlug = currentIndex > 0 ? NEWSLETTER_ORDER[currentIndex - 1] : null;
  const nextSlug =
    currentIndex < NEWSLETTER_ORDER.length - 1
      ? NEWSLETTER_ORDER[currentIndex + 1]
      : null;

  const prevNewsletter = prevSlug ? MOCK_NEWSLETTERS[prevSlug] : null;
  const nextNewsletter = nextSlug ? MOCK_NEWSLETTERS[nextSlug] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-6">
          <Link
            href={`/@${username}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {user.name}의 뉴스레터
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
        {/* Article Header */}
        <header className="mb-10">
          <time className="text-sm text-muted-foreground">
            {formatDate(newsletter.publishedAt)}
          </time>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {newsletter.title}
          </h1>

          {/* Author */}
          <div className="mt-6 flex items-center gap-3">
            <UserAvatar name={user.name} imageUrl={user.avatarUrl} size="md" />
            <div>
              <Link
                href={`/@${username}`}
                className="font-medium hover:underline"
              >
                {user.name}
              </Link>
              <p className="text-sm text-muted-foreground">@{username}</p>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-neutral max-w-none dark:prose-invert">
          {renderContent(newsletter.content)}
        </article>

        {/* Share Buttons */}
        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <span className="text-sm text-muted-foreground">공유하기</span>
          <ShareButtons title={newsletter.title} />
        </div>

        {/* Subscribe CTA */}
        <div className="mt-10 rounded-xl border border-border p-6 text-center">
          <h2 className="text-lg font-semibold">
            {user.name}의 뉴스레터 구독하기
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            새로운 글이 발행되면 이메일로 알려드립니다.
          </p>
          <div className="mt-4 mx-auto max-w-sm">
            <SubscribeForm username={username} />
          </div>
        </div>

        {/* Prev/Next Navigation */}
        {(prevNewsletter || nextNewsletter) && (
          <nav className="mt-10 grid gap-4 sm:grid-cols-2">
            {prevNewsletter ? (
              <Link
                href={`/@${username}/${prevNewsletter.slug}`}
                className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <span className="text-sm text-muted-foreground">← 이전 글</span>
                <p className="mt-1 font-medium line-clamp-1">
                  {prevNewsletter.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {nextNewsletter && (
              <Link
                href={`/@${username}/${nextNewsletter.slug}`}
                className="rounded-lg border border-border p-4 text-right transition-colors hover:bg-muted/50"
              >
                <span className="text-sm text-muted-foreground">다음 글 →</span>
                <p className="mt-1 font-medium line-clamp-1">
                  {nextNewsletter.title}
                </p>
              </Link>
            )}
          </nav>
        )}
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function renderContent(content: string) {
  // 간단한 마크다운 렌더링
  return content.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={index} />;

    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={index} className="mt-8 text-xl font-semibold">
          {trimmed.replace("## ", "")}
        </h2>
      );
    }

    if (trimmed.startsWith("- **")) {
      const match = trimmed.match(/- \*\*(.+?)\*\*: (.+)/);
      if (match) {
        return (
          <li key={index} className="ml-4">
            <strong>{match[1]}</strong>: {match[2]}
          </li>
        );
      }
    }

    if (trimmed.startsWith("- ")) {
      return (
        <li key={index} className="ml-4">
          {trimmed.replace("- ", "")}
        </li>
      );
    }

    return (
      <p key={index} className="mt-4 leading-relaxed">
        {trimmed}
      </p>
    );
  });
}

