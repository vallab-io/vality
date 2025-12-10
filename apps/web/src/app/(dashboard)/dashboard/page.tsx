import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "대시보드",
  description: "뉴스레터 관리 대시보드",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">뉴스레터 현황을 확인하세요</p>
        </div>
        <Link href="/dashboard/newsletters/new">
          <Button>새 뉴스레터 작성</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="총 구독자"
          value="0"
          description="활성 구독자 수"
        />
        <StatsCard
          title="발행된 뉴스레터"
          value="0"
          description="지금까지 발행한 뉴스레터"
        />
        <StatsCard
          title="평균 오픈율"
          value="0%"
          description="최근 30일 기준"
        />
      </div>

      {/* Recent Newsletters */}
      <Card>
        <CardHeader>
          <CardTitle>최근 뉴스레터</CardTitle>
          <CardDescription>최근 작성한 뉴스레터 목록</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="mb-4 text-muted-foreground">
              아직 작성한 뉴스레터가 없습니다.
            </p>
            <Link href="/dashboard/newsletters/new">
              <Button>첫 뉴스레터 작성하기</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
}

function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

