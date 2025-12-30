import type { Metadata } from "next";
import { Suspense } from "react";
import HomePageContent from "./_components/home-page-content";

export const metadata: Metadata = {
  title: "Home",
};

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">로딩 중...</div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
