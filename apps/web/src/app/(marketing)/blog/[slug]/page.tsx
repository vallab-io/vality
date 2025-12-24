import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingHeader } from "../../_components/marketing-header";
import { MarketingFooter } from "../../_components/marketing-footer";

// 임시 블로그 데이터
const BLOG_POSTS: Record<
  string,
  {
    title: string;
    description: string;
    date: string;
    category: string;
    content: string;
  }
> = {
  "welcome-to-vality": {
    title: "Vality를 소개합니다",
    description:
      "뉴스레터 발행과 웹 아카이빙을 동시에. Vality가 어떻게 탄생했는지 소개합니다.",
    date: "2025년 1월 15일",
    category: "공지",
    content: `
뉴스레터를 운영하면서 한 가지 아쉬운 점이 있었습니다. 열심히 작성한 글이 이메일로만 전달되고, 웹에서는 찾을 수 없다는 것이었죠.

## 문제 인식

많은 뉴스레터 플랫폼들이 있지만, 대부분 이메일 발송에만 집중합니다. 콘텐츠가 구독자의 받은편지함에만 존재하고, 검색 엔진에서는 발견되지 않죠.

이건 크리에이터에게 큰 손실입니다. 좋은 글이 있어도 새로운 독자가 찾아올 수 없으니까요.

## Vality의 접근법

Vality는 다릅니다. 뉴스레터를 발행하면:

1. **이메일 발송**: 구독자에게 즉시 전달됩니다.
2. **웹 아카이빙**: 고유 URL이 생성되어 누구나 읽을 수 있습니다.
3. **SEO 최적화**: 검색 엔진에서 발견될 수 있도록 자동으로 최적화됩니다.

한 번의 발행으로 세 가지가 동시에 완성됩니다.

## 앞으로의 계획

Vality는 이제 시작입니다. 앞으로 더 많은 기능을 추가할 예정입니다:

- 유료 구독 기능
- 커스텀 도메인
- 고급 분석 도구
- Bio 페이지 (링크트리 대체)

여러분의 피드백을 기다립니다. 함께 더 나은 뉴스레터 플랫폼을 만들어가요.
    `,
  },
  "newsletter-seo-guide": {
    title: "뉴스레터 SEO 최적화 가이드",
    description:
      "검색 엔진에서 발견되는 뉴스레터를 만드는 방법. 제목, 메타 설명, 구조화 데이터까지.",
    date: "2025년 1월 10일",
    category: "가이드",
    content: `
뉴스레터도 SEO가 가능할까요? Vality에서는 가능합니다. 웹에 자동으로 게시되기 때문이죠.

## 좋은 제목 작성하기

제목은 SEO에서 가장 중요한 요소입니다.

- **명확하게**: 무엇에 대한 글인지 알 수 있어야 합니다.
- **간결하게**: 60자 이내로 작성하세요.
- **키워드 포함**: 사람들이 검색할 만한 단어를 넣으세요.

## 메타 설명 활용하기

Vality는 본문 첫 부분을 자동으로 메타 설명으로 사용합니다. 첫 문장에 핵심 내용을 담으세요.

## 구조화된 콘텐츠

- 헤딩 태그(H2, H3)를 적절히 사용하세요.
- 단락을 짧게 나누세요.
- 목록을 활용하세요.

Vality가 나머지는 알아서 처리합니다. 구조화 데이터, OG 이미지, sitemap까지.
    `,
  },
  "email-deliverability-tips": {
    title: "이메일 전달률 높이는 5가지 팁",
    description:
      "스팸 폴더에 들어가지 않는 뉴스레터 작성법. 발신자 인증부터 콘텐츠 최적화까지.",
    date: "2025년 1월 5일",
    category: "팁",
    content: `
열심히 작성한 뉴스레터가 스팸 폴더로 간다면 너무 슬프죠. 전달률을 높이는 방법을 알아봅시다.

## 1. 발신자 인증 설정

SPF, DKIM, DMARC를 설정하면 이메일 제공업체가 여러분을 신뢰합니다. Vality에서는 자동으로 설정됩니다.

## 2. 깨끗한 구독자 목록 유지

- 반송되는 이메일은 즉시 제거하세요.
- 오랫동안 열지 않는 구독자는 재확인 이메일을 보내세요.

## 3. 스팸 트리거 단어 피하기

"무료", "지금 바로", "100%" 같은 단어는 조심해서 사용하세요.

## 4. 텍스트와 이미지 균형

이미지만 있는 이메일은 스팸으로 분류되기 쉽습니다. 텍스트를 충분히 포함하세요.

## 5. 일관된 발송 스케줄

불규칙한 발송보다 일정한 주기로 보내는 것이 좋습니다.
    `,
  },
  "building-subscriber-base": {
    title: "구독자 0명에서 1,000명까지",
    description:
      "처음 시작하는 뉴스레터가 구독자를 모으는 현실적인 방법들.",
    date: "2024년 12월 28일",
    category: "가이드",
    content: `
처음 시작할 때 가장 어려운 건 구독자 모으기입니다. 현실적인 방법들을 공유합니다.

## 첫 100명: 주변 사람들

- 지인에게 직접 소개하세요.
- SNS에 공유하세요.
- 기존 네트워크를 활용하세요.

## 100-500명: 콘텐츠의 힘

- 꾸준히 좋은 글을 쓰세요.
- SEO로 검색 유입을 만드세요. (Vality가 도와드립니다!)
- 다른 크리에이터와 교류하세요.

## 500-1,000명: 시스템 만들기

- 구독 CTA를 곳곳에 배치하세요.
- 인기 글을 활용하세요.
- 게스트 포스팅을 시도해보세요.

가장 중요한 건 꾸준함입니다. 일주일에 한 번이라도 좋으니, 계속 발행하세요.
    `,
  },
};

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(BLOG_POSTS).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS[slug];

  if (!post) {
    return { title: "게시글을 찾을 수 없습니다" };
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS[slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          ← 블로그로 돌아가기
        </Link>

        {/* Article */}
        <article className="mt-8">
          {/* Header */}
          <header className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.category}</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground">{post.description}</p>
          </header>

          {/* Content */}
          <div className="prose prose-neutral mt-12 max-w-none dark:prose-invert">
            {post.content.split("\n").map((paragraph, index) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith("## ")) {
                return (
                  <h2
                    key={index}
                    className="mt-8 text-xl font-semibold tracking-tight"
                  >
                    {trimmed.replace("## ", "")}
                  </h2>
                );
              }

              if (trimmed.startsWith("- ")) {
                return (
                  <li key={index} className="ml-4 text-muted-foreground">
                    {trimmed.replace("- ", "")}
                  </li>
                );
              }

              return (
                <p
                  key={index}
                  className="mt-4 leading-relaxed text-muted-foreground"
                >
                  {trimmed}
                </p>
              );
            })}
          </div>
        </article>
      </main>

      <MarketingFooter />
    </div>
  );
}

