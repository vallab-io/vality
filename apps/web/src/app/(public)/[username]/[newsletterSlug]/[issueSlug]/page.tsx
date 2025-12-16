import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserAvatar } from "@/components/common";
import { SubscribeForm } from "../../_components/subscribe-form";
import { ShareButtons } from "./_components/share-buttons";

// 목업 사용자 데이터
const MOCK_USERS: Record<string, { name: string; imageUrl: string | null }> = {
  johndoe: { name: "John Doe", imageUrl: null },
  jane: { name: "Jane Kim", imageUrl: null },
};

// 목업 뉴스레터 데이터
const MOCK_NEWSLETTERS: Record<string, Record<string, { name: string }>> = {
  johndoe: {
    weekly: { name: "John's Weekly" },
    "design-tips": { name: "Design Tips" },
  },
  jane: {
    "tech-notes": { name: "Tech Notes" },
  },
};

// 목업 이슈 데이터
const MOCK_ISSUES: Record<string, Record<string, Record<string, Issue>>> = {
  johndoe: {
    weekly: {
      "design-trends-2025": {
        id: "clh2issue001abc123def",
        slug: "design-trends-2025",
        title: "2025년 주목할 디자인 트렌드",
        publishedAt: "2025-01-15",
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
        id: "clh2issue002abc123def",
        slug: "productivity-tips",
        title: "디자이너를 위한 생산성 팁 10가지",
        publishedAt: "2025-01-08",
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
      "remote-work-guide": {
        id: "clh2issue003abc123def",
        slug: "remote-work-guide",
        title: "리모트 워크 3년차의 노하우",
        publishedAt: "2025-01-01",
        content: `
재택근무를 시작한 지 3년. 그동안 배운 것들과 효과적인 원격 협업 방법에 대해 공유합니다.

## 1. 전용 작업 공간 만들기

침대에서 일하지 마세요. 업무 전용 공간을 만들면 뇌가 "이제 일할 시간"이라고 인식합니다.

## 2. 루틴의 힘

출근하지 않더라도 아침 루틴을 유지하세요. 샤워하고, 옷을 갈아입고, 커피를 마시는 것만으로도 업무 모드로 전환됩니다.

## 3. 비동기 커뮤니케이션 마스터하기

모든 것을 회의로 해결하려 하지 마세요. 문서화된 커뮤니케이션의 힘을 믿으세요.

## 4. 카메라 켜기

화상 회의에서 카메라를 켜면 집중력이 높아지고, 팀원과의 연결감도 유지됩니다.

## 5. 명확한 업무 종료 시간

집에서 일하면 언제 끝내야 할지 모호해집니다. 명확한 종료 시간을 정하고 지키세요.
        `,
      },
    },
    "design-tips": {
      "figma-component-guide": {
        id: "clh2issue007abc123def",
        slug: "figma-component-guide",
        title: "Figma 컴포넌트 완벽 가이드",
        publishedAt: "2025-01-05",
        content: `
효율적인 컴포넌트 설계부터 베리언트 활용까지, Figma 컴포넌트의 모든 것을 다룹니다.

## 1. 컴포넌트란?

재사용 가능한 디자인 요소입니다. 한 번 만들어두면 프로젝트 전체에서 일관되게 사용할 수 있습니다.

## 2. 좋은 컴포넌트의 조건

- **유연성**: 다양한 상황에 대응 가능
- **일관성**: 동일한 패턴 유지
- **명확한 네이밍**: 누구나 찾기 쉬운 이름

## 3. 베리언트 활용하기

버튼의 크기, 상태, 스타일을 베리언트로 관리하면 훨씬 효율적입니다.

## 4. 컴포넌트 프로퍼티

Boolean, Instance swap, Text 프로퍼티를 활용해 더 유연한 컴포넌트를 만드세요.
        `,
      },
    },
  },
};

// 이슈 목록 (이전/다음 네비게이션용)
const ISSUE_ORDER: Record<string, Record<string, string[]>> = {
  johndoe: {
    weekly: ["design-trends-2025", "productivity-tips", "remote-work-guide"],
    "design-tips": ["figma-component-guide"],
  },
};

interface Issue {
  id: string;
  slug: string;
  title: string;
  publishedAt: string;
  content: string;
}

interface IssuePageProps {
  params: Promise<{ username: string; newsletterSlug: string; issueSlug: string }>;
}

export async function generateMetadata({
  params,
}: IssuePageProps): Promise<Metadata> {
  const { username, newsletterSlug, issueSlug } = await params;
  const issue = MOCK_ISSUES[username]?.[newsletterSlug]?.[issueSlug];
  const user = MOCK_USERS[username];

  if (!issue || !user) {
    return { title: "글을 찾을 수 없습니다" };
  }

  return {
    title: issue.title,
    description: issue.content.slice(0, 160).replace(/[#\n]/g, " ").trim(),
    openGraph: {
      title: issue.title,
      type: "article",
      authors: [user.name],
    },
  };
}

export default async function IssuePage({ params }: IssuePageProps) {
  const { username, newsletterSlug, issueSlug } = await params;
  const user = MOCK_USERS[username];
  const newsletter = MOCK_NEWSLETTERS[username]?.[newsletterSlug];
  const issue = MOCK_ISSUES[username]?.[newsletterSlug]?.[issueSlug];

  if (!user || !newsletter || !issue) {
    notFound();
  }

  // 이전/다음 글 찾기
  const issueOrder = ISSUE_ORDER[username]?.[newsletterSlug] || [];
  const currentIndex = issueOrder.indexOf(issueSlug);
  const prevSlug = currentIndex > 0 ? issueOrder[currentIndex - 1] : null;
  const nextSlug = currentIndex < issueOrder.length - 1 ? issueOrder[currentIndex + 1] : null;
  const prevIssue = prevSlug ? MOCK_ISSUES[username]?.[newsletterSlug]?.[prevSlug] : null;
  const nextIssue = nextSlug ? MOCK_ISSUES[username]?.[newsletterSlug]?.[nextSlug] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-6">
          <Link
            href={`/@${username}/${newsletterSlug}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {newsletter.name}
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
            {formatDate(issue.publishedAt)}
          </time>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {issue.title}
          </h1>

          {/* Author */}
          <div className="mt-6 flex items-center gap-3">
            <UserAvatar name={user.name} imageUrl={user.imageUrl} size="md" />
            <div>
              <Link href={`/@${username}`} className="font-medium hover:underline">
                {user.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                <Link href={`/@${username}/${newsletterSlug}`} className="hover:underline">
                  {newsletter.name}
                </Link>
              </p>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-neutral max-w-none dark:prose-invert">
          {renderContent(issue.content)}
        </article>

        {/* Share Buttons */}
        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <span className="text-sm text-muted-foreground">공유하기</span>
          <ShareButtons title={issue.title} />
        </div>

        {/* Subscribe CTA */}
        <div className="mt-10 rounded-xl border border-border p-6 text-center">
          <h2 className="text-lg font-semibold">{newsletter.name} 구독하기</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            새로운 글이 발행되면 이메일로 알려드립니다.
          </p>
          <div className="mx-auto mt-4 max-w-sm">
            <SubscribeForm username={username} newsletterSlug={newsletterSlug} />
          </div>
        </div>

        {/* Prev/Next Navigation */}
        {(prevIssue || nextIssue) && (
          <nav className="mt-10 grid gap-4 sm:grid-cols-2">
            {prevIssue ? (
              <Link
                href={`/@${username}/${newsletterSlug}/${prevIssue.slug}`}
                className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <span className="text-sm text-muted-foreground">← 이전 글</span>
                <p className="mt-1 font-medium line-clamp-1">{prevIssue.title}</p>
              </Link>
            ) : (
              <div />
            )}
            {nextIssue && (
              <Link
                href={`/@${username}/${newsletterSlug}/${nextIssue.slug}`}
                className="rounded-lg border border-border p-4 text-right transition-colors hover:bg-muted/50"
              >
                <span className="text-sm text-muted-foreground">다음 글 →</span>
                <p className="mt-1 font-medium line-clamp-1">{nextIssue.title}</p>
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
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

function renderContent(content: string) {
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

