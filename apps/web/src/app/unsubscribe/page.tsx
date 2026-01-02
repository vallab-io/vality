import type { Metadata } from "next";
import UnsubscribePageClient from "./_components/unsubscribe-page-client";

export const metadata: Metadata = {
  title: "Unsubscribe",
};

export default function UnsubscribePage() {
  return <UnsubscribePageClient />;
}

