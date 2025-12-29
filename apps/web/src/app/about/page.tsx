import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "../(marketing)/_components/marketing-header";
import { MarketingFooter } from "../(marketing)/_components/marketing-footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl px-6 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              뉴스레터를 쉽게,
              <br />
              <span className="bg-gradient-to-r from-primary to-[#38BDF8] bg-clip-text text-transparent">
                Vality로 시작하세요
              </span>
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              개인 창작자를 위한 뉴스레터 플랫폼입니다. 기술적 복잡성 없이 글쓰기에만 집중할 수 있도록<br />설계되었으며, 혼자서도 쉽게 시작할 수 있습니다.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base font-medium">
                  무료로 시작하기
                </Button>
              </Link>
              <Link
                href="/home"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                뉴스레터 보기 →
              </Link>
            </div>
          </div>
        </section>

        {/* Vality가 줄 가치 */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold tracking-tight mb-4">
                개인 창작자를 위한 진정한 가치를 전달합니다
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <ValueCard
                icon={<HeartIcon />}
                title="구독자들에게 당신의 진정성을 전달하세요"
                description="여러분이 진짜로 세상에 알리고 싶은 진정성을 전달하세요. 구독자들에게 가치를 주는 콘텐츠로 깊이 있는 소통을 만들어보세요."
              />
              <ValueCard
                icon={<ZapIcon />}
                title="당신에게 꼭 필요한 서비스"
                description="쉽고 빠르게 당신을 알릴 수 있게 도와드립니다. SEO 최적화된 뉴스레터 이슈로 더 많은 사람들에게 효과적으로 알릴 수 있습니다."
              />
              <ValueCard
                icon={<InfinityIcon />}
                title="장기적으로 볼 때"
                description="개인 창작자를 도울 수 있는 여러 서비스를 계획하고 있습니다. 정말 장기적인 계획을 가지고 있습니다. 더 오래, 그보다 더 오래 함께하겠습니다."
              />
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-3xl px-6 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold tracking-tight mb-4">
                Vality가 도와드리겠습니다
              </h2>
            </div>
            <div className="space-y-16">
              <FeatureDetail
                icon={<EditorIcon />}
                title="쉽게 발행"
                description="직관적인 에디터로 글을 작성하고, 발행 버튼 하나로 뉴스레터를 발행할 수 있습니다. 이미지 업로드와 실시간 미리보기 기능을 제공합니다. 기술적 복잡성 없이 글쓰기에만 집중하세요."
              />

              <FeatureDetail
                icon={<SearchIcon />}
                title="발견되는 뉴스레터"
                description="검색엔진에 최적화된 뉴스레터를 효과적으로 사람들에게 알릴 수 있습니다. 발행한 모든 글이 SEO 최적화된 웹 페이지로 자동 생성되어 구글에서 검색되면 새로운 독자를 자연스럽게 만날 수 있습니다. 별도의 블로그나 웹사이트가 필요 없습니다."
              />

              <FeatureDetail
                icon={<ChartIcon />}
                title="통계와 데이터"
                description="복잡한 분석 도구가 아닌, 필요한 핵심 지표만 보여줍니다. 데이터로 뉴스레터의 성과를 측정하고 개선하세요."
              />

              <FeatureDetail
                icon={<UsersIcon />}
                title="구독자 관리"
                description="구독자 목록을 쉽게 관리하고, 구독 상태를 추적할 수 있습니다. 수동으로 구독자를 추가하거나 제거할 수 있으며, 각 구독자의 상태를 한눈에 확인할 수 있습니다."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-3xl px-6 py-24 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              지금 뉴스레터를 시작해보세요
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              복잡한 설정 없이, 바로 글쓰기를 시작하세요.
            </p>
            <p className="mt-4 text-lg text-foreground font-medium">
              가치 있는 뉴스레터를 전달하세요.
            </p>
            <p className="mt-2 text-lg text-foreground font-medium">
              진정성을 담은 콘텐츠로 독자와 연결하세요.
            </p>
            <div className="mt-10">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base font-medium">
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

function WhoItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function ValueMessage({ message }: { message: string }) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card text-center">
      <p className="text-lg font-medium text-foreground">{message}</p>
    </div>
  );
}

function FeatureDetail({
  icon,
  title,
  description,
}: {
  icon?: React.ReactElement;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6">
      {icon && (
        <div className="flex-shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-2xl font-semibold mb-4">{title}</h3>
        <p className="text-muted-foreground leading-relaxed text-lg">{description}</p>
      </div>
    </div>
  );
}

function HowItWorksStep({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-semibold">
          {step}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactElement;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-xl border border-border bg-card p-8 transition-all duration-200 hover:border-primary/30 hover:shadow-lg">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-4 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function HeartIcon() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function InfinityIcon() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18.178 8.088c.5.5.822 1.2.822 1.912s-.322 1.412-.822 1.912c-.5.5-1.2.822-1.912.822s-1.412-.322-1.912-.822L12 12l-1.354 1.912c-.5.5-1.2.822-1.912.822s-1.412-.322-1.912-.822c-.5-.5-.822-1.2-.822-1.912s.322-1.412.822-1.912c.5-.5 1.2-.822 1.912-.822s1.412.322 1.912.822L12 12l1.354-1.912c.5-.5 1.2-.822 1.912-.822s1.412.322 1.912.822z" />
    </svg>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-border pb-6 last:border-b-0 last:pb-0">
      <h3 className="text-lg font-semibold mb-2">{question}</h3>
      <p className="text-muted-foreground leading-relaxed">{answer}</p>
    </div>
  );
}

// Illustration Components
function DashboardIllustration({ className }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
        {/* Dashboard Header */}
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary/20"></div>
            <div className="h-4 w-24 rounded bg-muted"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded bg-muted"></div>
            <div className="h-8 w-8 rounded bg-muted"></div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-2 h-3 w-16 rounded bg-muted"></div>
                <div className="h-6 w-12 rounded bg-primary/20"></div>
              </div>
            ))}
          </div>

          {/* Content Area */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-muted"></div>
              <div className="h-4 w-3/4 rounded bg-muted"></div>
              <div className="h-4 w-5/6 rounded bg-muted"></div>
            </div>
          </div>

          {/* List Items */}
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded border border-border bg-card p-3">
                <div className="h-10 w-10 rounded bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-muted"></div>
                  <div className="h-2 w-1/2 rounded bg-muted/50"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorIcon() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
