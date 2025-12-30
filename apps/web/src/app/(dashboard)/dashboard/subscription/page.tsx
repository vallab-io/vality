import type { Metadata } from "next";
import SubscriptionPageClient from "./subscription-page-client";

export const metadata: Metadata = {
  title: "Subscription",
};

export default function SubscriptionPage() {
  return <SubscriptionPageClient />;
}
