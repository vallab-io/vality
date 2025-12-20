"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon } from "@/components/icons";
import { createIssue, getIssueById, updateIssue, type CreateIssueRequest, type UpdateIssueRequest } from "@/lib/api/issue";
import { getNewsletterById, type Newsletter } from "@/lib/api/newsletter";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/auth.store";
import { ValityEditor } from "@/components/editor/vality-editor";

type PreviewMode = "archive" | "email";
type RecipientOption = "everyone" | "nobody";
type SendOption = "now" | "scheduled";

export default function IssuePage() {
  const params = useParams();
  const router = useRouter();
  const newsletterId = params.newsletterId as string;
  const issueId = params.issueId as string; // 동적 라우트에서 issueId 가져오기
  const user = useAtomValue(userAtom);

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("email");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // 발행 옵션 상태
  const [recipientOption, setRecipientOption] = useState<RecipientOption>("everyone");
  const [sendOption, setSendOption] = useState<SendOption>("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "", // HTML 형식으로 저장
  });

  const [publishSlug, setPublishSlug] = useState("");

  // 뉴스레터 및 이슈 정보 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // 뉴스레터 정보 로드
        const newsletterData = await getNewsletterById(newsletterId);
        setNewsletter(newsletterData);

        // issueId가 "new"가 아니면 기존 이슈 로드
        if (issueId && issueId !== "new") {
          const issueData = await getIssueById(newsletterId, issueId);
          setFormData({
            title: issueData.title || "",
            content: issueData.content,
          });
          setPublishSlug(issueData.slug);
        }
      } catch (error: any) {
        console.error("Failed to load data:", error);
        toast.error(error.message || "데이터를 불러오는데 실패했습니다.");
        if (issueId && issueId !== "new") {
          router.push(`/dashboard/newsletters/${newsletterId}/issues`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (newsletterId) {
      loadData();
    }
  }, [newsletterId, issueId, router]);

  const generateSlug = (title: string) => {
    // 한글/기타 문자는 제거하고 영문 소문자, 숫자, 하이픈만 허용
    const cleaned = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // 발음기호 제거
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    return cleaned || `issue-${Date.now()}`;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, title: e.target.value });
  };

  const handleContentChange = (html: string) => {
    setFormData({ ...formData, content: html });
  };

  const handleSaveDraft = async () => {
    if (!formData.content.trim() || formData.content === "<p></p>") {
      toast.error("본문을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      if (issueId && issueId !== "new") {
        // 기존 이슈 수정
        const request: UpdateIssueRequest = {
          title: formData.title.trim() || null,
          content: formData.content,
          status: "DRAFT",
        };
        await updateIssue(newsletterId, issueId, request);
      } else {
        // 새 이슈 생성
        const slug = publishSlug.trim() || (formData.title.trim() ? generateSlug(formData.title) : undefined);
        const request: CreateIssueRequest = {
          title: formData.title.trim() || null,
          slug: slug || undefined,
          content: formData.content,
          status: "DRAFT",
        };
        const createdIssue = await createIssue(newsletterId, request);
        // 생성된 이슈의 페이지로 리다이렉트
        router.replace(`/dashboard/newsletters/${newsletterId}/issues/${createdIssue.id}`);
        toast.success("임시저장되었습니다.");
        return; // 리다이렉트 후 함수 종료
      }
      toast.success("임시저장되었습니다.");
    } catch (error: any) {
      console.error("Save draft error:", error);
      const errorMessage = error.response?.data?.message || error.message || "저장에 실패했습니다.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const openPublishDialog = () => {
    // 발행 시 제목 필수
    if (!formData.title.trim()) {
      toast.error("발행하려면 제목을 입력해주세요.");
      return;
    }
    if (!formData.content.trim() || formData.content === "<p></p>") {
      toast.error("본문을 입력해주세요.");
      return;
    }
    if (!publishSlug.trim()) {
      setPublishSlug(generateSlug(formData.title));
    }
    setShowPublishDialog(true);
  };

  const handlePublish = async () => {
    // 발행 시 제목 필수
    if (!formData.title.trim()) {
      toast.error("발행하려면 제목을 입력해주세요.");
      return;
    }

    if (!publishSlug.trim()) {
      toast.error("URL 슬러그를 입력해주세요.");
      return;
    }

    setIsPublishing(true);
    try {
      let status: "PUBLISHED" | "SCHEDULED" = "PUBLISHED";
      let scheduledAt: string | null = null;

      // 이메일 발송은 아직 구현하지 않으므로, recipientOption은 무시하고 상태만 결정
      if (sendOption === "scheduled") {
        if (!scheduledDate || !scheduledTime) {
          toast.error("예약 날짜와 시간을 입력해주세요.");
          setIsPublishing(false);
          return;
        }
        status = "SCHEDULED";
        scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      }

      if (issueId && issueId !== "new") {
        // 기존 이슈 수정 및 발행
        const request: UpdateIssueRequest = {
          title: formData.title.trim(),
          slug: publishSlug.trim(),
          content: formData.content,
          status: status,
          scheduledAt: scheduledAt,
        };
        await updateIssue(newsletterId, issueId, request);
      } else {
        // 새 이슈 생성 및 발행
        const request: CreateIssueRequest = {
          title: formData.title.trim(),
          slug: publishSlug.trim(),
          content: formData.content,
          status: status,
          scheduledAt: scheduledAt,
        };
        await createIssue(newsletterId, request);
      }

      if (status === "SCHEDULED") {
        toast.success(
          `발행 예약 완료! ${scheduledDate} ${scheduledTime}에 발행됩니다.`
        );
      } else {
        toast.success("발행되었습니다!");
      }

      router.push(`/dashboard/newsletters/${newsletterId}/issues`);
    } catch (error: any) {
      console.error("Publish error:", error);
      const errorMessage = error.response?.data?.message || error.message || "발행에 실패했습니다.";
      toast.error(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPublishSlug(e.target.value);
  };

  // 최소 예약 가능 날짜 (현재 날짜)
  const today = new Date().toISOString().split("T")[0];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-3">
        <Link href={`/dashboard/newsletters/${newsletterId}/issues`}>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            뒤로
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="h-8"
          >
            {isSaving ? "저장 중..." : "임시저장"}
          </Button>
          <Button onClick={openPublishDialog} disabled={isPublishing} className="h-8">
            발행하기
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden bg-muted/20">
        {/* Editor Section */}
        <div className="flex flex-1 flex-col border-r border-border/50 bg-background">
          {/* Title Input */}
          <div className="border-b border-border/50 bg-background px-8 py-6">
            <Input
              type="text"
              placeholder="제목을 입력하세요"
              value={formData.title}
              onChange={handleTitleChange}
              className="border-0 bg-transparent px-0 text-3xl font-semibold leading-tight placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Content Editor */}
          <div className="flex-1 overflow-auto px-8 py-6">
            <div className="mx-auto max-w-3xl">
              <ValityEditor
                content={formData.content}
                onChange={handleContentChange}
                placeholder="'/'를 눌러주세요"
                issueId={issueId && issueId !== "new" ? issueId : undefined}
              />
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="w-[480px] border-l border-border/50 bg-muted/20">
          <div className="sticky top-0 flex h-full flex-col">
            {/* Preview Header */}
            <div className="flex items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-foreground">미리보기</h2>
              <div className="flex gap-1 rounded-md bg-muted/80 p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewMode("email")}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                    previewMode === "email"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  이메일
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("archive")}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                    previewMode === "archive"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  아카이브
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="flex justify-center">
                {previewMode === "email" ? (
                  <EmailPreview
                    title={formData.title}
                    content={formData.content}
                    newsletterName={newsletter?.name || ""}
                  />
                ) : (
                  <ArchivePreview
                    title={formData.title}
                    content={formData.content}
                    author={user?.username || ""}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>발행 설정</DialogTitle>
            <DialogDescription>
              발행 설정을 확인하고 이슈를 발행하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* URL Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">URL 슬러그</Label>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm text-muted-foreground">
                  /@{user?.username || "username"}/{newsletter?.slug || "slug"}/
                </span>
                <Input
                  id="slug"
                  value={publishSlug}
                  onChange={handleSlugChange}
                  placeholder="url-slug"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다.
              </p>
            </div>

            {/* Send Timing */}
            <div className="space-y-3">
              <Label>발행 시점</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSendOption("now")}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    sendOption === "now"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className="font-medium">지금 발행</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    즉시 발행됩니다
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSendOption("scheduled")}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    sendOption === "scheduled"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className="font-medium">예약 발행</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    나중에 발행
                  </div>
                </button>
              </div>

              {sendOption === "scheduled" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="date">날짜</Label>
                    <Input
                      id="date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={today}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="time">시간</Label>
                    <Input
                      id="time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPublishDialog(false)}
              disabled={isPublishing}
            >
              취소
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing
                ? "발행 중..."
                : sendOption === "scheduled"
                ? "예약 발행"
                : "발행하기"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 아카이브 미리보기 컴포넌트
function ArchivePreview({
  title,
  content,
  author,
}: {
  title: string;
  content: string;
  author: string;
}) {
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full max-w-[360px] rounded-lg border border-border bg-background shadow-sm">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-xl font-bold leading-tight">{title || "제목 없음"}</h1>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-6 w-6 rounded-full bg-muted" />
          <span>@{author}</span>
          <span>·</span>
          <time>{today}</time>
        </div>
      </header>
      <article
        className="prose prose-sm prose-neutral max-w-none px-6 py-4 dark:prose-invert [&_img]:mx-auto [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

// 이메일 미리보기 컴포넌트
function EmailPreview({
  title,
  content,
  newsletterName,
}: {
  title: string;
  content: string;
  newsletterName: string;
}) {
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full max-w-[360px] rounded-lg border border-border bg-background shadow-sm">
      <div className="rounded-t-lg border-b border-border bg-muted/30 px-4 py-2">
        <p className="text-xs font-medium text-muted-foreground">이메일 미리보기</p>
      </div>

      <div className="p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {newsletterName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{newsletterName}</div>
            <div className="text-xs text-muted-foreground">{today}</div>
          </div>
        </div>

        <h1 className="mb-3 text-lg font-bold leading-tight">{title || "제목 없음"}</h1>
        <div
          className="prose prose-sm prose-neutral max-w-none dark:prose-invert [&_img]:mx-auto [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}

