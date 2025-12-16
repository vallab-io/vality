"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PlusIcon, MoreIcon, EditIcon, TrashIcon } from "@/components/icons";

// 목업 이슈 데이터
const MOCK_ISSUES = [
  {
    id: "clh2issue001abc123def",
    title: "2025년 주목할 디자인 트렌드",
    slug: "design-trends-2025",
    status: "published" as const,
    publishedAt: "2025-01-15",
    createdAt: "2025-01-14",
    excerpt: "새해를 맞아 올해 주목할 만한 디자인 트렌드를 정리해 보았습니다.",
  },
  {
    id: "clh2issue002abc123def",
    title: "디자이너를 위한 생산성 팁 10가지",
    slug: "productivity-tips",
    status: "published" as const,
    publishedAt: "2025-01-08",
    createdAt: "2025-01-07",
    excerpt: "바쁜 일상 속에서 효율적으로 일하는 방법을 공유합니다.",
  },
  {
    id: "clh2issue003abc123def",
    title: "리모트 워크 가이드 (작성중)",
    slug: "remote-work-guide",
    status: "draft" as const,
    publishedAt: null,
    createdAt: "2025-01-10",
    excerpt: "재택근무를 시작하는 분들을 위한 가이드입니다.",
  },
  {
    id: "clh2issue004abc123def",
    title: "2024년 회고: 성장과 변화의 한 해",
    slug: "year-in-review-2024",
    status: "published" as const,
    publishedAt: "2024-12-28",
    createdAt: "2024-12-27",
    excerpt: "한 해를 돌아보며 배운 것들과 새해 목표를 공유합니다.",
  },
  {
    id: "clh2issue005abc123def",
    title: "AI 도구 활용법 정리",
    slug: "ai-tools",
    status: "draft" as const,
    publishedAt: null,
    createdAt: "2025-01-12",
    excerpt: "업무에 활용할 수 있는 AI 도구들을 정리해 보았습니다.",
  },
];

type IssueStatus = "all" | "draft" | "published";
type SortOrder = "newest" | "oldest";

const STATUS_LABELS: Record<IssueStatus, string> = {
  all: "전체",
  draft: "초안",
  published: "발행됨",
};

const STATUS_BADGE_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400",
  published: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  scheduled: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
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

export default function IssuesPage() {
  const params = useParams();
  const newsletterId = params.newsletterId as string;
  
  const [issues] = useState(MOCK_ISSUES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IssueStatus>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  // 필터링 및 정렬
  const filteredIssues = issues
    .filter((issue) => {
      const matchesSearch = issue.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || issue.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  // 상태별 카운트
  const statusCounts = {
    all: issues.length,
    draft: issues.filter((i) => i.status === "draft").length,
    published: issues.filter((i) => i.status === "published").length,
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 이슈를 삭제하시겠습니까?`)) return;

    try {
      console.log("Delete issue:", id);
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("이슈가 삭제되었습니다.");
    } catch (error) {
      console.error("Delete issue error:", error);
      toast.error("이슈 삭제에 실패했습니다.");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <PageHeader title="이슈" />
        <Link href={`/dashboard/newsletters/${newsletterId}/issues/new`}>
          <Button size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            새 이슈 작성
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {(["all", "published", "draft"] as const).map((status) => (
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
            placeholder="제목으로 검색..."
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as IssueStatus)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["all", "published", "draft"] as const).map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value as SortOrder)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">최신순</SelectItem>
            <SelectItem value="oldest">오래된순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Issue List */}
      <div className="mt-6">
        {filteredIssues.length === 0 ? (
          <div className="rounded-lg border border-border py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="font-medium">
              {searchQuery || statusFilter !== "all"
                ? "검색 결과가 없습니다"
                : "아직 작성된 이슈가 없습니다"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "다른 검색어나 필터를 사용해보세요."
                : "첫 번째 이슈를 작성해보세요."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href={`/dashboard/newsletters/${newsletterId}/issues/new`}>
                <Button className="mt-4" size="sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  새 이슈 작성
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="group rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/newsletters/${newsletterId}/issues/${issue.id}/edit`}
                        className="font-medium hover:underline truncate"
                      >
                        {issue.title}
                      </Link>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                          STATUS_BADGE_COLORS[issue.status]
                        )}
                      >
                        {issue.status === "draft" ? "초안" : "발행됨"}
                      </span>
                    </div>
                    {issue.excerpt && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {issue.excerpt}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      {issue.status === "published" ? (
                        <span>발행일: {formatDate(issue.publishedAt)}</span>
                      ) : (
                        <span>작성일: {formatDate(issue.createdAt)}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <MoreIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/newsletters/${newsletterId}/issues/${issue.id}/edit`}>
                          <EditIcon className="mr-2 h-4 w-4" />
                          편집
                        </Link>
                      </DropdownMenuItem>
                      {issue.status === "published" && (
                        <DropdownMenuItem asChild>
                          <Link href={`/@johndoe/${issue.slug}`} target="_blank">
                            <svg
                              className="mr-2 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                            보기
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(issue.id, issue.title)}
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {filteredIssues.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          총 {filteredIssues.length}개의 이슈
          {statusFilter !== "all" && ` (${STATUS_LABELS[statusFilter]})`}
        </div>
      )}
    </div>
  );
}

