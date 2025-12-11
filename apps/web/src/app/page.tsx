import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Vality
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">시작하기</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="mx-auto max-w-5xl px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              뉴스레터를 발행하면,
              <br />
              웹에 자동으로 기록됩니다.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              한 번의 발행으로 이메일, 블로그, 프로필 콘텐츠가 동시에 완성됩니다.
              <br />
              검색 엔진에 노출되어 새로운 독자를 만나보세요.
            </p>
            <div className="mt-10 flex items-center gap-3">
              <Link href="/signup">
                <Button size="lg" className="h-11 px-6">
                  무료로 시작하기
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" size="lg" className="h-11 px-6">
                  둘러보기
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <h2 className="text-2xl font-semibold tracking-tight">
              글쓰기에만 집중하세요.
            </h2>
            <p className="mt-2 text-muted-foreground">
              나머지는 Vality가 처리합니다.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <FeatureCard
                title="뉴스레터 발송"
                description="깔끔한 에디터로 작성하고, 버튼 하나로 구독자에게 전송하세요."
              />
              <FeatureCard
                title="웹 자동 아카이빙"
                description="발행 즉시 고유 URL이 생성됩니다. 블로그처럼 웹에서 읽을 수 있어요."
              />
              <FeatureCard
                title="검색 엔진 최적화"
                description="SEO가 자동으로 적용됩니다. 구글에서 새로운 독자를 만나세요."
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <h2 className="text-2xl font-semibold tracking-tight">
              이렇게 동작합니다
            </h2>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <StepCard
                step="1"
                title="글을 작성합니다"
                description="에디터에서 자유롭게 작성하세요."
              />
              <StepCard
                step="2"
                title="발행 버튼을 누릅니다"
                description="구독자에게 이메일이 발송됩니다."
              />
              <StepCard
                step="3"
                title="웹에 자동으로 게시됩니다"
                description="SEO 최적화된 페이지가 생성됩니다."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-foreground text-background">
          <div className="mx-auto max-w-5xl px-6 py-24 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              지금 시작하세요
            </h2>
            <p className="mt-3 text-background/70">
              무료로 뉴스레터를 시작할 수 있습니다.
            </p>
            <div className="mt-8">
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-11 px-6"
                >
                  무료로 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <p className="text-sm text-muted-foreground">
            © 2025 Vality
          </p>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">
              이용약관
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              개인정보처리방침
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

interface StepCardProps {
  step: string;
  title: string;
  description: string;
}

function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="space-y-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background">
        {step}
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
