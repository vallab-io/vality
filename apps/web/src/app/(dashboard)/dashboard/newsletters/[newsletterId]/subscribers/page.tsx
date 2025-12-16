"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PlusIcon, TrashIcon } from "@/components/icons";

// 목업 구독자 데이터
const MOCK_SUBSCRIBERS = [
  {
    id: "clh3sub001abc123def789",
    email: "alice@example.com",
    status: "active" as const,
    subscribedAt: "2025-01-15",
    confirmedAt: "2025-01-15",
  },
  {
    id: "clh3sub002abc123def789",
    email: "bob@example.com",
    status: "active" as const,
    subscribedAt: "2025-01-10",
    confirmedAt: "2025-01-10",
  },
  {
    id: "clh3sub003abc123def789",
    email: "charlie@example.com",
    status: "pending" as const,
    subscribedAt: "2025-01-08",
    confirmedAt: null,
  },
  {
    id: "clh3sub004abc123def789",
    email: "diana@example.com",
    status: "active" as const,
    subscribedAt: "2025-01-05",
    confirmedAt: "2025-01-05",
  },
  {
    id: "clh3sub005abc123def789",
    email: "eve@example.com",
    status: "unsubscribed" as const,
    subscribedAt: "2024-12-20",
    confirmedAt: "2024-12-20",
  },
];

type SubscriberStatus = "all" | "active" | "pending" | "unsubscribed";

const STATUS_LABELS: Record<SubscriberStatus, string> = {
  all: "전체",
  active: "활성",
  pending: "대기",
  unsubscribed: "취소",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pending: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  unsubscribed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

// 검색 아이콘
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

// 다운로드 아이콘
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

export default function SubscribersPage() {
  const params = useParams();
  const newsletterId = params.newsletterId as string;
  
  // newsletterId를 활용해 해당 뉴스레터의 구독자만 필터링 가능
  console.log("Newsletter ID:", newsletterId);
  
  const [subscribers] = useState(MOCK_SUBSCRIBERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriberStatus>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // 필터링된 구독자 목록
  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesSearch = subscriber.email
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || subscriber.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 상태별 카운트
  const statusCounts = {
    all: subscribers.length,
    active: subscribers.filter((s) => s.status === "active").length,
    pending: subscribers.filter((s) => s.status === "pending").length,
    unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
  };

  const handleAddSubscriber = async () => {
    if (!newEmail) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    setIsAdding(true);
    try {
      // TODO: API 연동
      console.log("Add subscriber:", newEmail, "to newsletter:", newsletterId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("구독자가 추가되었습니다.");
      setNewEmail("");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Add subscriber error:", error);
      toast.error("구독자 추가에 실패했습니다.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!confirm(`${email} 구독자를 삭제하시겠습니까?`)) return;

    try {
      // TODO: API 연동
      console.log("Delete subscriber:", id);
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("구독자가 삭제되었습니다.");
    } catch (error) {
      console.error("Delete subscriber error:", error);
      toast.error("구독자 삭제에 실패했습니다.");
    }
  };

  const handleExportCSV = () => {
    toast.info("CSV 내보내기는 준비 중입니다.");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <PageHeader title="구독자" />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            CSV 내보내기
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusIcon className="mr-2 h-4 w-4" />
                구독자 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>구독자 추가</DialogTitle>
                <DialogDescription>
                  새 구독자의 이메일을 입력하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="subscriber@example.com"
                    disabled={isAdding}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isAdding}
                >
                  취소
                </Button>
                <Button onClick={handleAddSubscriber} disabled={isAdding}>
                  {isAdding ? "추가 중..." : "추가"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        {(["all", "active", "pending", "unsubscribed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              "rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50",
              statusFilter === status && "border-primary bg-muted"
            )}
          >
            <p className="text-2xl font-semibold">{statusCounts[status]}</p>
            <p className="text-sm text-muted-foreground">{STATUS_LABELS[status]}</p>
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="mt-6 flex gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이메일로 검색..."
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as SubscriberStatus)}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["all", "active", "pending", "unsubscribed"] as const).map(
              (status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Subscriber List */}
      <div className="mt-6 rounded-lg border border-border">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
          <div className="col-span-5">이메일</div>
          <div className="col-span-2">상태</div>
          <div className="col-span-3">구독일</div>
          <div className="col-span-2 text-right">작업</div>
        </div>

        {/* Table Body */}
        {filteredSubscribers.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "검색 결과가 없습니다."
              : "아직 구독자가 없습니다."}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredSubscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className="grid grid-cols-12 items-center gap-4 px-4 py-3 text-sm hover:bg-muted/30"
              >
                <div className="col-span-5 truncate font-medium">
                  {subscriber.email}
                </div>
                <div className="col-span-2">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      STATUS_COLORS[subscriber.status]
                    )}
                  >
                    {STATUS_LABELS[subscriber.status]}
                  </span>
                </div>
                <div className="col-span-3 text-muted-foreground">
                  {formatDate(subscriber.subscribedAt)}
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      handleDeleteSubscriber(subscriber.id, subscriber.email)
                    }
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-sm text-muted-foreground">
        총 {filteredSubscribers.length}명의 구독자
        {statusFilter !== "all" && ` (${STATUS_LABELS[statusFilter]})`}
      </div>
    </div>
  );
}

