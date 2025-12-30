import type { Metadata } from "next";
import EmbedPageClient from "./embed-page-client";

export const metadata: Metadata = {
  title: "Embed Widget",
};

export default function EmbedPage() {
  return <EmbedPageClient />;
}
