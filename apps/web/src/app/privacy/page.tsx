import { Metadata } from "next";
import { MarketingHeader } from "../(marketing)/_components/marketing-header";
import { MarketingFooter } from "../(marketing)/_components/marketing-footer";
import { PrivacyPageClient } from "./_components/privacy-page-client";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Vality Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <PrivacyPageClient />
      <MarketingFooter />
    </div>
  );
}
