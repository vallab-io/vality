import { Metadata } from "next";
import { MarketingHeader } from "../_components/marketing-header";
import { MarketingFooter } from "../_components/marketing-footer";
import { PricingPageClient } from "./_components/pricing-page-client";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Vality pricing - Early Access members get 3 months of Pro plan free",
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
