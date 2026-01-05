"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import { PlusIcon, MoreIcon, EditIcon, TrashIcon, SearchIcon } from "@/components/icons";
import { getIssues, deleteIssue, createIssue, type Issue } from "@/lib/api/issue";
import { getNewsletterById, type Newsletter } from "@/lib/api/newsletter";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/auth.store";
import { localeAtom } from "@/stores/locale.store";
import { useT } from "@/hooks/use-translation";
import { formatRelativeTime } from "@/lib/utils/date";
import { useTopbarAction } from "../../../../_components/topbar-action-context";

type IssueStatus = "all" | "draft" | "published";
type SortOrder = "newest" | "oldest";

const STATUS_BADGE_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400",
  PUBLISHED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  SCHEDULED: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  ARCHIVED: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400",
};

export default function IssuesPageClient() {
  const params = useParams();
  const router = useRouter();
  const newsletterId = params.newsletterId as string;
  const user = useAtomValue(userAtom);
  const t = useT();
  const { setAction } = useTopbarAction();
  
  const [issues, setIssues] = useState<Issue[]>([]);
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IssueStatus>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const STATUS_LABELS: Record<IssueStatus, string> = {
    all: t("issues.all"),
    draft: t("issues.draft"),
    published: t("issues.published"),
  };

  const STATUS_DISPLAY: Record<string, string> = {
    DRAFT: t("issues.draft"),
    PUBLISHED: t("issues.published"),
    SCHEDULED: t("issues.scheduled"),
    ARCHIVED: t("issues.archived"),
  };

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [issuesData, newsletterData] = await Promise.all([
          getIssues(newsletterId),
          getNewsletterById(newsletterId),
        ]);
        setIssues(issuesData);
        setNewsletter(newsletterData);
      } catch (error: any) {
        console.error("Failed to load issues:", error);
        toast.error(error.message || t("issues.failedToLoad"));
      } finally {
        setIsLoading(false);
      }
    };

    if (newsletterId) {
      loadData();
    }
  }, [newsletterId]);

  // 새 이슈 생성 핸들러
  const handleCreateNewIssue = useCallback(async () => {
    setIsCreating(true);
    try {
      const newIssue = await createIssue(newsletterId, {
        status: "DRAFT",
        content: "",
      });
      router.push(`/dashboard/newsletters/${newsletterId}/issues/${newIssue.id}`);
    } catch (error: any) {
      console.error("Failed to create issue:", error);
      toast.error(error.message || "Failed to create issue");
    } finally {
      setIsCreating(false);
    }
  }, [newsletterId, router]);

  // Topbar에 New Issue 버튼 설정
  useEffect(() => {
    setAction(
      <Button 
        size="sm" 
        onClick={handleCreateNewIssue}
        disabled={isCreating}
      >
        <PlusIcon className="mr-2 h-4 w-4" />
        {isCreating ? t("issues.creating") : t("issues.newIssue")}
      </Button>
    );
    return () => setAction(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleCreateNewIssue, isCreating, setAction]);

  // 필터링 및 정렬
  const filteredIssues = issues
    .filter((issue) => {
      // 검색어가 비어있으면 모든 이슈 매치, 아니면 title에서 검색
      const matchesSearch = searchQuery.trim() === "" 
        ? true 
        : (issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "draft" && issue.status === "DRAFT") ||
        (statusFilter === "published" && issue.status === "PUBLISHED");
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
    draft: issues.filter((i) => i.status === "DRAFT").length,
    published: issues.filter((i) => i.status === "PUBLISHED").length,
  };

  const handleDelete = async (id: string, title: string | null) => {
    const issueTitle = title || t("common.untitled");
    if (!confirm(t("issues.deleteConfirm").replace("{title}", issueTitle))) return;

    try {
      await deleteIssue(newsletterId, id);
      setIssues(issues.filter((issue) => issue.id !== id));
      toast.success(t("issues.deleted"));
    } catch (error: any) {
      console.error("Delete issue error:", error);
      toast.error(error.message || t("issues.deleteFailed"));
    }
  };

  const locale = useAtomValue(localeAtom);
  const formatDateLocal = (dateString: string | null) => {
    if (!dateString) return "-";
    return formatRelativeTime(dateString, locale);
  };

  // 공개 URL 생성
  const getPublicIssueUrl = (issue: Issue) => {
    if (!user?.username || !newsletter) return null;
    return `/@${user.username}/${newsletter.slug}/${issue.slug}`;
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">{t("issues.loadingIssues")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
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
            placeholder={t("issues.searchPlaceholder")}
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
            <SelectItem value="newest">{t("issues.newest")}</SelectItem>
            <SelectItem value="oldest">{t("issues.oldest")}</SelectItem>
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
                ? t("issues.noResults")
                : t("issues.noIssues")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? t("issues.noResultsDesc")
                : t("issues.noIssuesDesc")}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button 
                className="mt-4" 
                size="sm"
                onClick={handleCreateNewIssue}
                disabled={isCreating}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                {isCreating ? t("issues.creating") : t("issues.newIssue")}
              </Button>
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
                        href={`/dashboard/newsletters/${newsletterId}/issues/${issue.id}`}
                        className={cn(
                          "font-medium hover:underline truncate",
                          !issue.title && "text-muted-foreground italic"
                        )}
                      >
                        {issue.title || t("common.untitled")}
                      </Link>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                          STATUS_BADGE_COLORS[issue.status] || STATUS_BADGE_COLORS.DRAFT
                        )}
                      >
                        {STATUS_DISPLAY[issue.status] || issue.status}
                      </span>
                    </div>
                    {issue.excerpt && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {issue.excerpt}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      {issue.status === "PUBLISHED" && issue.publishedAt ? (
                        <span>{t("issues.publishedAt")}: {formatDateLocal(issue.publishedAt)}</span>
                      ) : issue.scheduledAt ? (
                        <span>{t("issues.scheduledAt")}: {formatDateLocal(issue.scheduledAt)}</span>
                      ) : (
                        <span>{t("issues.createdAt")}: {formatDateLocal(issue.createdAt)}</span>
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
                        <Link href={`/dashboard/newsletters/${newsletterId}/issues/${issue.id}`}>
                          <EditIcon className="mr-2 h-4 w-4" />
                          {t("issues.edit")}
                        </Link>
                      </DropdownMenuItem>
                      {issue.status === "PUBLISHED" && getPublicIssueUrl(issue) && (
                        <DropdownMenuItem asChild>
                          <Link href={getPublicIssueUrl(issue)!} target="_blank">
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
                            {t("issues.view")}
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(issue.id, issue.title)}
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        {t("common.delete")}
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
          {t("issues.totalIssues").replace("{count}", String(filteredIssues.length))}
          {statusFilter !== "all" && ` (${STATUS_LABELS[statusFilter]})`}
        </div>
      )}
    </div>
  );
}
