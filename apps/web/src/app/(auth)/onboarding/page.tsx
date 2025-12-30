import type { Metadata } from "next";
import OnboardingPageClient from "./onboarding-page-client";

export const metadata: Metadata = {
  title: "Onboarding",
};

export default function OnboardingPage() {
  return <OnboardingPageClient />;
}
