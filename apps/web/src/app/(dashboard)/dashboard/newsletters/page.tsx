"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyNewsletters } from "@/lib/api/newsletter";

export default function NewslettersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        const newsletters = await getMyNewsletters();
        // 뉴스레터가 있으면 첫 번째 뉴스레터의 이슈 페이지로 리다이렉트
        if (newsletters.length > 0) {
          router.replace(`/dashboard/newsletters/${newsletters[0].id}/issues`);
        } else {
          // 뉴스레터가 없으면 onboarding으로 리다이렉트
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error("Failed to fetch newsletters:", error);
        router.replace("/onboarding");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewsletters();
  }, [router]);

  // 리다이렉트 중 로딩 표시
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-muted-foreground">로딩 중...</div>
    </div>
  );
}
