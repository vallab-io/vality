import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "../_components/marketing-header";
import { MarketingFooter } from "../_components/marketing-footer";

export const metadata: Metadata = {
  title: "가격안내",
  description: "Vality 요금제를 확인하세요. 무료로 시작할 수 있습니다.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            심플한 가격 정책
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            무료로 시작하고, 성장에 맞게 업그레이드하세요.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {/* Free Plan */}
          <div className="rounded-lg border border-border p-8">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Free</h2>
              <p className="text-sm text-muted-foreground">
                개인 뉴스레터를 시작하기에 충분합니다.
              </p>
            </div>

            <div className="mt-6">
              <span className="text-4xl font-semibold">₩0</span>
              <span className="text-muted-foreground"> / 월</span>
            </div>

            <ul className="mt-8 space-y-3">
              <PricingFeature>구독자 500명까지</PricingFeature>
              <PricingFeature>월 1,000건 이메일 발송</PricingFeature>
              <PricingFeature>웹 아카이빙 (SEO 최적화)</PricingFeature>
              <PricingFeature>기본 분석 대시보드</PricingFeature>
              <PricingFeature>커스텀 프로필 페이지</PricingFeature>
            </ul>

            <div className="mt-8">
              <Link href="/signup">
                <Button variant="outline" className="h-11 w-full">
                  무료로 시작하기
                </Button>
              </Link>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="rounded-lg border-2 border-foreground p-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Pro</h2>
                <span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-medium text-background">
                  추천
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                성장하는 크리에이터를 위한 플랜입니다.
              </p>
            </div>

            <div className="mt-6">
              <span className="text-4xl font-semibold">₩9,900</span>
              <span className="text-muted-foreground"> / 월</span>
            </div>

            <ul className="mt-8 space-y-3">
              <PricingFeature>구독자 무제한</PricingFeature>
              <PricingFeature>이메일 발송 무제한</PricingFeature>
              <PricingFeature>커스텀 도메인 연결</PricingFeature>
              <PricingFeature>고급 분석 및 리포트</PricingFeature>
              <PricingFeature>유료 구독 기능</PricingFeature>
              <PricingFeature>우선 지원</PricingFeature>
            </ul>

            <div className="mt-8">
              <Link href="/signup">
                <Button className="h-11 w-full">Pro 시작하기</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <h2 className="text-2xl font-semibold tracking-tight">
            자주 묻는 질문
          </h2>

          <div className="mt-8 space-y-6">
            <FaqItem
              question="무료 플랜으로 충분한가요?"
              answer="네, 대부분의 개인 뉴스레터는 무료 플랜으로 충분합니다. 구독자가 500명을 넘거나 더 많은 기능이 필요할 때 업그레이드하세요."
            />
            <FaqItem
              question="언제든 플랜을 변경할 수 있나요?"
              answer="네, 언제든지 업그레이드하거나 다운그레이드할 수 있습니다. 변경은 다음 결제일부터 적용됩니다."
            />
            <FaqItem
              question="결제 수단은 무엇을 지원하나요?"
              answer="신용카드와 체크카드를 지원합니다. 해외 결제가 가능한 카드면 됩니다."
            />
            <FaqItem
              question="환불 정책은 어떻게 되나요?"
              answer="결제 후 7일 이내에 요청하시면 전액 환불해 드립니다."
            />
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <CheckIcon />
      <span>{children}</span>
    </li>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-foreground"
    >
      <path
        d="M13.5 4.5L6 12L2.5 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">{question}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{answer}</p>
    </div>
  );
}

