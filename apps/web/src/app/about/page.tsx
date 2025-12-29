import { Metadata } from "next";
import { MarketingHeader } from "../(marketing)/_components/marketing-header";
import { MarketingFooter } from "../(marketing)/_components/marketing-footer";
import { AboutPageClient } from "./_components/about-page-client";

export const metadata: Metadata = {
  title: "About",
  description: "A newsletter platform for individual creators",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <AboutPageClient />
      <MarketingFooter />
    </div>
  );
}
