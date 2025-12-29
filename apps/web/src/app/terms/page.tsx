import { Metadata } from "next";
import { MarketingHeader } from "../(marketing)/_components/marketing-header";
import { MarketingFooter } from "../(marketing)/_components/marketing-footer";
import { TermsPageClient } from "./_components/terms-page-client";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Vality Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <TermsPageClient />
      <MarketingFooter />
    </div>
  );
}
