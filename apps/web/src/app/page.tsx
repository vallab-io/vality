import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "./(marketing)/_components/marketing-header";
import { MarketingFooter } from "./(marketing)/_components/marketing-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      {/* Hero Section */}
      <main>
        <section className="relative mx-auto max-w-5xl px-6 py-24 md:py-32 overflow-hidden">
          {/* 배경 그라데이션 효과 */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/50 via-transparent to-cyan-50/30 dark:from-blue-950/10 dark:via-transparent dark:to-cyan-950/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-3xl -z-10" />
          
          <div className="max-w-2xl relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 text-sm text-blue-700 dark:text-blue-300 mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              새로운 크리에이터를 위한 플랫폼
            </div>
            
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl animate-fade-in-up">
              뉴스레터를 발행하면,
              <br />
              <span className="bg-gradient-to-r from-[#2563EB] to-[#38BDF8] dark:from-[#3B82F6] dark:to-[#60A5FA] bg-clip-text text-transparent">
                웹에 자동으로 기록됩니다.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground animate-fade-in-up animation-delay-200">
              한 번의 발행으로 이메일, 블로그, 프로필 콘텐츠가 동시에 완성됩니다.
              <br />
              검색 엔진에 노출되어 새로운 독자를 만나보세요.
            </p>
            <div className="mt-10 flex items-center gap-3 animate-fade-in-up animation-delay-400">
              <Link href="/signup">
                <Button size="lg" className="h-11 px-6 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 bg-primary hover:bg-primary/90">
                  무료로 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-gradient-to-b from-muted/30 to-background">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold tracking-tight">
                글쓰기에만 집중하세요.
              </h2>
              <p className="mt-3 text-muted-foreground text-lg">
                나머지는 Vality가 처리합니다.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon="📧"
                title="뉴스레터 발송"
                description="깔끔한 에디터로 작성하고, 버튼 하나로 구독자에게 전송하세요."
              />
              <FeatureCard
                icon="🌐"
                title="웹 자동 아카이빙"
                description="발행 즉시 고유 URL이 생성됩니다. 블로그처럼 웹에서 읽을 수 있어요."
              />
              <FeatureCard
                icon="🔍"
                title="검색 엔진 최적화"
                description="SEO가 자동으로 적용됩니다. 구글에서 새로운 독자를 만나세요."
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold tracking-tight">
                이렇게 동작합니다
              </h2>
              <p className="mt-3 text-muted-foreground text-lg">
                간단한 3단계로 시작하세요
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
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
        <section className="relative border-t border-border overflow-hidden">
          {/* 배경 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB] via-[#3B82F6] to-[#38BDF8] dark:from-[#1E40AF] dark:via-[#2563EB] dark:to-[#0EA5E9]" />
          {/* 패턴 효과 */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }} />
          
          <div className="relative mx-auto max-w-5xl px-6 py-24 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
              지금 시작하세요
            </h2>
            <p className="mt-4 text-lg text-white/90">
              무료로 뉴스레터를 시작할 수 있습니다.
            </p>
            <div className="mt-10">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-medium shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 bg-white text-[#2563EB] hover:bg-white/95">
                  무료로 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
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
    <div className="group relative p-6 rounded-xl border border-border bg-card hover:border-blue-200 dark:hover:border-blue-800/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {/* 호버 시 파란색 포인트 라인 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl" />
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
    <div className="group relative">
      <div className="flex flex-col items-center text-center space-y-4 p-6">
        {/* 큰 스텝 번호 원 */}
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#38BDF8] text-2xl font-bold text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
            {step}
          </div>
          {/* 연결선 (마지막 카드 제외) */}
          {step !== "3" && (
            <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent -translate-y-1/2 -z-10" />
          )}
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
