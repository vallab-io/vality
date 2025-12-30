import type { Metadata } from "next";
import SubscribersPageClient from "./subscribers-page-client";

export const metadata: Metadata = {
  title: "Subscribers",
};

export default function SubscribersPage() {
  return <SubscribersPageClient />;
}
