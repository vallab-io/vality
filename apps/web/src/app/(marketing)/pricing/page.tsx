import { Metadata } from "next";
import { MarketingHeader } from "../_components/marketing-header";
import { MarketingFooter } from "../_components/marketing-footer";
import { PricingPageClient } from "./_components/pricing-page-client";

export const metadata: Metadata = {
  title: "가격안내",
  description: "Vality 가격 정책 - Early Access 가입자 한정 Pro 플랜 3개월 무료 혜택",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <PricingPageClient />
      <MarketingFooter />
    </div>
  );
}
