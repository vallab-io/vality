"use client";

import { useEffect, useState } from "react";
import {
  getAvailablePlans,
  getMySubscription,
  type PlanType,
  type Subscription,
} from "@/lib/api/subscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLAN_DESCRIPTIONS: Record<PlanType, { price: string; features: string[] }> = {
  FREE: {
    price: "$0 / 월",
    features: ["구독자 500명", "월 1,000건 이메일", "웹 아카이빙", "기본 분석"],
  },
  STARTER: {
    price: "$9.99 / 월",
    features: ["구독자 2,000명", "월 5,000건 이메일", "커스텀 도메인", "고급 분석"],
  },
  PRO: {
    price: "$29.99 / 월",
    features: ["구독자 무제한", "이메일 무제한", "커스텀 도메인", "고급 리포트 & 우선 지원"],
  },
};

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [planList, mySubscription] = await Promise.all([getAvailablePlans(), getMySubscription()]);
        setPlans(planList);
        setSubscription(mySubscription);
      } catch (error) {
        console.error("Failed to load subscription info:", error);
        setError("구독 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentPlan = subscription?.planType ?? "FREE";
  const status = subscription?.status ?? "ACTIVE";
  const nextBilling = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "다음 결제 예정 없음";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">구독 관리</h1>
          <p className="mt-2 text-sm text-muted-foreground">현재 플랜을 확인하고 업그레이드하세요.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm font-semibold">
            현재 플랜: {currentPlan}
          </Badge>
          <Badge variant="secondary" className="text-xs font-semibold">
            상태: {status}
          </Badge>
        </div>
      </div>

      {isLoading && <div className="mt-10 text-sm text-muted-foreground">불러오는 중...</div>}

      {error && (
        <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="mt-6 rounded-xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-3">
              <span>다음 결제 예정일:</span>
              <Badge variant="outline">{nextBilling}</Badge>
              {subscription?.cancelAtPeriodEnd && (
                <Badge variant="secondary" className="text-xs font-semibold">
                  기간 종료 후 취소 예정
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isActive = plan === currentPlan;
              const info = PLAN_DESCRIPTIONS[plan];
              return (
                <div
                  key={plan}
                  className={cn(
                    "rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md",
                    isActive && "border-primary/60 bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">{plan}</h2>
                    {isActive && <Badge className="bg-primary text-primary-foreground">현재 플랜</Badge>}
                  </div>
                  <div className="mt-3 text-2xl font-bold text-foreground">{info.price}</div>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {info.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-6 w-full" variant={isActive ? "outline" : "default"} disabled={isActive}>
                    {isActive ? "현재 사용 중" : "업그레이드"}
                  </Button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

