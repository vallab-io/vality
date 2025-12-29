import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingHeader } from "../_components/marketing-header";
import { MarketingFooter } from "../_components/marketing-footer";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "가격안내",
  description: "Vality 가격 정책 - Early Access 가입자 한정 Pro 플랜 3개월 무료 혜택",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            가격 안내
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            지금 가입하시면 Founding Member 혜택을 받으실 수 있습니다
          </p>
        </div>

        {/* Early Access Banner */}
        <div className="mt-12 rounded-xl border-2 border-primary/20 bg-primary/5 p-8 md:p-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <span>🎉</span>
            <span>Early Access 특별 혜택</span>
          </div>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
            Founding Member가 되어보세요
          </h2>
          <p className="mt-4 text-lg font-medium text-foreground">
            지금 가입하시면 Founding Member가 되어,
            <br />
            결제 시스템 출시 후 <span className="text-primary font-semibold">Pro 플랜을 3개월간 무료</span>로 이용하실 수 있습니다
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              Early Access 가입자 한정
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              결제 시스템 출시 시 자동 적용
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              별도 등록 불필요
            </li>
          </ul>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base font-medium bg-primary hover:bg-primary/90">
                Founding Member로 시작하기
              </Button>
            </Link>
          </div>
        </div>

      </main>

      <MarketingFooter />
    </div>
  );
}

function PricingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <span className="text-muted-foreground">{text}</span>
    </li>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
