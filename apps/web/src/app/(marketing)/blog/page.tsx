import { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "../_components/marketing-header";
import { MarketingFooter } from "../_components/marketing-footer";

export const metadata: Metadata = {
  title: "블로그",
  description: "Vality 팀의 이야기와 뉴스레터 작성 팁을 만나보세요.",
};

// 임시 블로그 데이터
const BLOG_POSTS = [
  {
    slug: "welcome-to-vality",
    title: "Vality를 소개합니다",
    description:
      "뉴스레터 발행과 웹 아카이빙을 동시에. Vality가 어떻게 탄생했는지 소개합니다.",
    date: "2025년 1월 15일",
    category: "공지",
  },
  {
    slug: "newsletter-seo-guide",
    title: "뉴스레터 SEO 최적화 가이드",
    description:
      "검색 엔진에서 발견되는 뉴스레터를 만드는 방법. 제목, 메타 설명, 구조화 데이터까지.",
    date: "2025년 1월 10일",
    category: "가이드",
  },
  {
    slug: "email-deliverability-tips",
    title: "이메일 전달률 높이는 5가지 팁",
    description:
      "스팸 폴더에 들어가지 않는 뉴스레터 작성법. 발신자 인증부터 콘텐츠 최적화까지.",
    date: "2025년 1월 5일",
    category: "팁",
  },
  {
    slug: "building-subscriber-base",
    title: "구독자 0명에서 1,000명까지",
    description:
      "처음 시작하는 뉴스레터가 구독자를 모으는 현실적인 방법들.",
    date: "2024년 12월 28일",
    category: "가이드",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            블로그
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            뉴스레터 운영에 도움이 되는 이야기들
          </p>
        </div>

        {/* Blog Posts */}
        <div className="mt-12 space-y-1">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-lg p-4 -mx-4 transition-colors hover:bg-muted/50"
            >
              <article className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.category}</span>
                </div>
                <h2 className="text-lg font-medium group-hover:text-foreground/80">
                  {post.title}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {post.description}
                </p>
              </article>
            </Link>
          ))}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

