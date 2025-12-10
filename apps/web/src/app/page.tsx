import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold">Vality</div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/signup">
              <Button>시작하기</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            뉴스레터를 발행하면
            <br />
            <span className="text-primary">웹에 자동으로 기록</span>됩니다
          </h1>
          <p className="mb-10 text-xl text-muted-foreground">
            한 번 발행으로 이메일 · 블로그 · 프로필 콘텐츠가 동시에 완성되는
            <br />
            개인 브랜딩 플랫폼
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                무료로 시작하기
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="px-8">
                둘러보기
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon="📨"
            title="뉴스레터 발송"
            description="구독자에게 직접 이메일을 보내고, 소통하세요."
          />
          <FeatureCard
            icon="🌐"
            title="웹 자동 아카이빙"
            description="발행 즉시 SEO 최적화된 웹페이지가 생성됩니다."
          />
          <FeatureCard
            icon="📈"
            title="검색 엔진 노출"
            description="구글 검색을 통해 새로운 독자를 만나보세요."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-10 text-center text-sm text-muted-foreground">
        <p>© 2025 Vality. All rights reserved.</p>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
