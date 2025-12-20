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
import { createIssue, type CreateIssueRequest } from "@/lib/api/issue";
import { getNewsletterById, type Newsletter } from "@/lib/api/newsletter";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/auth.store";
import { ValityEditor } from "@/components/editor/vality-editor";

// 목업 뉴스레터 데이터
const MOCK_NEWSLETTER = {
  id: "clh1abc123def456ghi789",
  name: "John's Weekly",
  slug: "weekly",
};

const MOCK_USER = {
  username: "johndoe",
};

type PreviewMode = "blog" | "email";
type RecipientOption = "everyone" | "nobody";
type SendOption = "now" | "scheduled";

export default function NewIssuePage() {
  const params = useParams();
  const router = useRouter();
  const newsletterId = params.newsletterId as string;
  const user = useAtomValue(userAtom);

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("email");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
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

  // 뉴스레터 정보 로드
  useEffect(() => {
    const loadNewsletter = async () => {
      try {
        const data = await getNewsletterById(newsletterId);
        setNewsletter(data);
      } catch (error: any) {
        console.error("Failed to load newsletter:", error);
        toast.error(error.message || "뉴스레터 정보를 불러오는데 실패했습니다.");
      }
    };

    if (newsletterId) {
      loadNewsletter();
    }
  }, [newsletterId]);

  const generateSlug = (title: string) => {
    // 한글/기타 문자는 제거하고 영문 소문자, 숫자, 하이픈만 허용
    const cleaned = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // 발음기호 제거
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);

    // 모두 제거되면 안전한 기본값 사용
    return cleaned || `issue-${Date.now()}`;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleContentChange = (htmlContent: string) => {
    setFormData((prev) => ({ ...prev, content: htmlContent }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
    setPublishSlug(value);
  };


  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    if (!formData.content.trim() || formData.content === "<p></p>") {
      toast.error("본문을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const slug = publishSlug.trim() || generateSlug(formData.title);
      
      const request: CreateIssueRequest = {
        title: formData.title.trim(),
        slug: slug,
        content: formData.content,
        status: "DRAFT",
      };

      await createIssue(newsletterId, request);
      toast.success("임시저장되었습니다.");
      router.push(`/dashboard/newsletters/${newsletterId}/issues`);
    } catch (error: any) {
      console.error("Save draft error:", error);
      const errorMessage = error.response?.data?.message || error.message || "저장에 실패했습니다.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const openPublishDialog = () => {
    if (!formData.title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!formData.content.trim() || formData.content === "<p></p>") {
      toast.error("본문을 입력해주세요.");
      return;
    }
    setPublishSlug(generateSlug(formData.title));
    setShowPublishDialog(true);
  };

  const handlePublish = async () => {
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

      const request: CreateIssueRequest = {
        title: formData.title.trim(),
        slug: publishSlug.trim(),
        content: formData.content,
        status: status,
        scheduledAt: scheduledAt,
      };

      await createIssue(newsletterId, request);

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

  // 최소 예약 가능 날짜 (현재 날짜)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <Link
          href={`/dashboard/newsletters/${newsletterId}/issues`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          나가기
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleSaveDraft}
            disabled={isSaving || isPublishing}
            className="text-primary hover:text-primary"
          >
            {isSaving ? "저장 중..." : "임시저장"}
          </Button>
          <Button
            onClick={openPublishDialog}
            disabled={isSaving || isPublishing}
            className="bg-primary hover:bg-primary/90"
          >
            발행하기
          </Button>
        </div>
      </div>

      {/* Split View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Editor */}
        <div className="flex w-1/2 flex-col border-r border-border">
          {/* Editor Header */}
          <div className="border-b border-border p-4">
            <Input
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="제목을 입력하세요"
              className="border-0 bg-transparent px-0 text-2xl font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0"
            />
            <div className="mt-2 h-1 w-12 bg-primary" />
          </div>

          {/* Content Editor */}
          <div className="flex-1 overflow-auto">
            <ValityEditor
              content={formData.content}
              onChange={handleContentChange}
              placeholder="'/'를 눌러주세요"
            />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex w-1/2 flex-col bg-muted/30">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-medium text-muted-foreground">
              미리보기
            </span>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              <button
                onClick={() => setPreviewMode("blog")}
                className={cn(
                  "rounded px-3 py-1 text-xs font-medium transition-colors",
                  previewMode === "blog"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                아카이브
              </button>
              <button
                onClick={() => setPreviewMode("email")}
                className={cn(
                  "rounded px-3 py-1 text-xs font-medium transition-colors",
                  previewMode === "email"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                이메일
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {formData.content && formData.content !== "<p></p>" ? (
              previewMode === "blog" ? (
                <BlogPreview
                  title={formData.title}
                  content={formData.content}
                  author={user?.username || "username"}
                />
              ) : (
                <EmailPreview
                  title={formData.title}
                  content={formData.content}
                  newsletterName={newsletter?.name || "Newsletter"}
                />
              )
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                왼쪽에서 내용을 입력하면 미리보기가 표시됩니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>이슈 발행</DialogTitle>
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
                    "rounded-lg border p-3 text-left transition-colors",
                    sendOption === "now"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <SendIcon className="h-4 w-4" />
                    <span className="font-medium">바로 발행</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    즉시 발행 (PUBLISHED)
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setSendOption("scheduled")}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    sendOption === "scheduled"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span className="font-medium">예약 발행</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    날짜와 시간 지정 (SCHEDULED)
                  </p>
                </button>
              </div>

              {/* Scheduled Date/Time */}
              {sendOption === "scheduled" && (
                <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
                  <div className="space-y-1">
                    <Label htmlFor="date" className="text-xs">
                      날짜
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      min={today}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="time" className="text-xs">
                      시간
                    </Label>
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


function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function NoMailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6z" />
      <path d="M2 6l10 7 10-7" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22,2 15,22 11,13 2,9 22,2" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

// 블로그 미리보기 컴포넌트
function BlogPreview({
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
    <div className="mx-auto max-w-2xl rounded-lg border border-border bg-background p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{title || "제목을 입력하세요"}</h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <span>@{author}</span>
          <span>·</span>
          <time>{today}</time>
        </div>
      </header>
      <article
        className="prose prose-neutral max-w-none dark:prose-invert"
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
    <div className="mx-auto max-w-xl">
      <div className="rounded-t-lg border border-b-0 border-border bg-muted/50 px-4 py-2">
        <p className="text-xs text-muted-foreground">이메일 미리보기</p>
      </div>

      <div className="rounded-b-lg border border-border bg-background">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {newsletterName[0]}
            </div>
            <div>
              <p className="font-medium">{newsletterName}</p>
              <p className="text-xs text-muted-foreground">newsletter@vality.io</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="font-semibold">{title || "제목을 입력하세요"}</p>
            <p className="text-xs text-muted-foreground">{today}</p>
          </div>
        </div>

        <div className="p-6">
          <article
            className="prose prose-sm prose-neutral max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        <div className="border-t border-border bg-muted/30 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            이 이메일은 {newsletterName} 뉴스레터 구독자에게 발송되었습니다.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="underline">구독 취소</span> ·{" "}
            <span className="underline">웹에서 보기</span>
          </p>
        </div>
      </div>
    </div>
  );
}

