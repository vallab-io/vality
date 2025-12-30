import type { Metadata } from "next";
import IssuesPageClient from "./issues-page-client";

export const metadata: Metadata = {
  title: "Issues",
};

export default function IssuesPage() {
  return <IssuesPageClient />;
}
