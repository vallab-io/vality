import { PageHeader } from "@/components/common";

export default function SubscriptionPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="구독 관리"
        description="유료 플랜 및 구독 관리는 곧 제공될 예정입니다."
      />

      <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
        <div className="mb-4 text-6xl">🚀</div>
        <h2 className="text-2xl font-semibold text-foreground">Coming Soon</h2>
        <p className="mt-4 max-w-md text-muted-foreground">
          유료 플랜 및 구독 관리 기능을 준비 중입니다.
          <br />
          곧 만나보실 수 있습니다.
        </p>
      </div>
    </div>
  );
}

