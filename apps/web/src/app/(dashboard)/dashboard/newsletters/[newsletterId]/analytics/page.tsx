"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";


export default function AnalyticsPage() {
  const params = useParams();
  const newsletterId = params.newsletterId as string;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="통계"
        description="뉴스레터 성과를 확인하세요."
      />

      <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
        <div className="mb-4 text-6xl">🚀</div>
        <h2 className="text-2xl font-semibold text-foreground">Coming Soon</h2>
        <p className="mt-4 max-w-md text-muted-foreground">
          상세한 통계 및 분석 기능을 준비 중입니다.
          <br />
          곧 만나보실 수 있습니다.
        </p>
      </div>

      {/* 추가될 기능 설명 */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="mb-3 text-2xl">👥</div>
            <h3 className="text-sm font-medium text-foreground mb-2">구독자 통계</h3>
            <p className="text-xs text-muted-foreground">
              총 구독자 수, 신규 구독자, 이탈률, 구독자 성장 추이 등을 확인할 수 있습니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-3 text-2xl">📧</div>
            <h3 className="text-sm font-medium text-foreground mb-2">이메일 성과</h3>
            <p className="text-xs text-muted-foreground">
              이메일 오픈율, 클릭율, 구독 취소율, 발송 시간별 성과 등을 분석합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-3 text-2xl">📈</div>
            <h3 className="text-sm font-medium text-foreground mb-2">이슈별 분석</h3>
            <p className="text-xs text-muted-foreground">
              각 이슈의 조회수, 좋아요 수, 공유 횟수, 클릭률 등 상세 성과를 추적합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-3 text-2xl">📅</div>
            <h3 className="text-sm font-medium text-foreground mb-2">기간별 비교</h3>
            <p className="text-xs text-muted-foreground">
              일별, 주별, 월별 성과를 비교하고 트렌드를 파악할 수 있습니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-3 text-2xl">🎯</div>
            <h3 className="text-sm font-medium text-foreground mb-2">세그먼트 분석</h3>
            <p className="text-xs text-muted-foreground">
              구독자 그룹별 성과를 분석하여 타겟팅 전략을 수립할 수 있습니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-3 text-2xl">📊</div>
            <h3 className="text-sm font-medium text-foreground mb-2">시각화 차트</h3>
            <p className="text-xs text-muted-foreground">
              직관적인 그래프와 차트로 데이터를 시각화하여 한눈에 파악할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

