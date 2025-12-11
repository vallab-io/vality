"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 목업 데이터 - 실제로는 API에서 가져와야 함
const MOCK_NEWSLETTERS = [
  { id: "clh1abc123def456ghi789", name: "John's Weekly", slug: "johns-weekly" },
];

export default function NewslettersPage() {
  const router = useRouter();

  useEffect(() => {
    // 뉴스레터가 있으면 첫 번째 뉴스레터의 이슈 페이지로 리다이렉트
    if (MOCK_NEWSLETTERS.length > 0) {
      router.replace(`/dashboard/newsletters/${MOCK_NEWSLETTERS[0].id}/issues`);
    }
    // 뉴스레터가 없으면 생성 페이지로 리다이렉트
    // router.replace("/dashboard/newsletters/new");
  }, [router]);

  // 리다이렉트 중 로딩 표시
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-muted-foreground">로딩 중...</div>
    </div>
  );
}
