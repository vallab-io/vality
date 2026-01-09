"use client";

import { useState, useEffect, useCallback } from "react";
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
import { getSubscribers } from "@/lib/api/subscriber";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/auth.store";
import { localeAtom } from "@/stores/locale.store";
import { ValityEditor } from "@/components/editor/vality-editor";
import { useT } from "@/hooks/use-translation";
import { formatRelativeTime } from "@/lib/utils/date";

type PreviewMode = "archive" | "email";
type SendOption = "now" | "scheduled";

export default function IssuePage() {
  const params = useParams();
  const router = useRouter();
  const newsletterId = params.newsletterId as string;
  const issueId = params.issueId as string;
  const user = useAtomValue(userAtom);
  const t = useT();

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [activeSubscriberCount, setActiveSubscriberCount] = useState<number>(0);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("email");
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // 발행 옵션 상태
  const [sendOption, setSendOption] = useState<SendOption>("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const [publishSlug, setPublishSlug] = useState("");
  const [issueStatus, setIssueStatus] = useState<"DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | null>(null);

  // 뉴스레터 및 이슈 정보 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const newsletterData = await getNewsletterById(newsletterId);
        setNewsletter(newsletterData);

        // 활성 구독자 수 가져오기
        try {
          const activeSubscribers = await getSubscribers(newsletterId, "ACTIVE");
          setActiveSubscriberCount(activeSubscribers.length);
        } catch {
          // 구독자 로드 실패해도 에디터는 사용 가능
          setActiveSubscriberCount(0);
        }

        if (issueId && issueId !== "new") {
          const issueData = await getIssueById(newsletterId, issueId);
          setFormData({
            title: issueData.title || "",
            content: issueData.content,
          });
          setPublishSlug(issueData.slug);
          setIssueStatus(issueData.status);
        } else {
          // 새 이슈는 기본적으로 DRAFT
          setIssueStatus("DRAFT");
        }
      } catch (error: any) {
        console.error("Failed to load data:", error);
        toast.error(error.message || t("editor.loadFailed"));
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
    const cleaned = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    return cleaned || `issue-${Date.now()}`;
  };

  const handleSaveDraft = useCallback(async () => {
    if (!formData.content.trim() || formData.content === "<p></p>") {
      toast.error(t("editor.contentRequired"));
      return;
    }

    setIsSaving(true);
    try {
      if (issueId && issueId !== "new") {
        const request: UpdateIssueRequest = {
          title: formData.title.trim() || null,
          content: formData.content,
          status: "DRAFT",
        };
        await updateIssue(newsletterId, issueId, request);
      } else {
        const slug = publishSlug.trim() || (formData.title.trim() ? generateSlug(formData.title) : undefined);
        const request: CreateIssueRequest = {
          title: formData.title.trim() || null,
          slug: slug || undefined,
          content: formData.content,
          status: "DRAFT",
        };
        const createdIssue = await createIssue(newsletterId, request);
        router.replace(`/dashboard/newsletters/${newsletterId}/issues/${createdIssue.id}`);
        toast.success(t("editor.saved"));
        return;
      }
      toast.success(t("editor.saved"));
    } catch (error: any) {
      console.error("Save draft error:", error);
      const errorMessage = error.response?.data?.message || error.message || t("editor.saveFailed");
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [formData, issueId, newsletterId, publishSlug, router, t]);

  // Command/Ctrl+S 키보드 단축키로 draft 저장
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command+S (Mac) 또는 Ctrl+S (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        
        // status가 DRAFT일 때만 저장
        if (issueStatus === "DRAFT" && !isSaving && !isPublishing) {
          handleSaveDraft();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [issueStatus, isSaving, isPublishing, handleSaveDraft]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, title: e.target.value });
  };

  const handleContentChange = (html: string) => {
    setFormData({ ...formData, content: html });
  };

  // 마지막 <br> 태그들과 빈 <p><br></p> 태그들을 제거하는 함수
  const removeTrailingBrTags = (html: string): string => {
    if (!html || !html.trim()) return html;
    
    // HTML을 파싱하여 마지막 <br> 태그들을 제거
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const body = doc.body;
    
    // <p> 태그가 <br>만 포함하고 있는지 확인하는 함수
    const isEmptyParagraph = (pElement: HTMLElement): boolean => {
      if (pElement.tagName !== "P") return false;
      
      const children = Array.from(pElement.childNodes);
      // 모든 자식이 <br> 태그이거나 공백 텍스트인지 확인
      return children.every((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          return !child.textContent?.trim();
        }
        if (child.nodeType === Node.ELEMENT_NODE) {
          return (child as HTMLElement).tagName === "BR";
        }
        return false;
      });
    };
    
    // 재귀적으로 마지막 <br> 태그들을 제거하는 함수
    const removeBrFromElement = (element: HTMLElement): void => {
      // 자식 요소가 있으면 재귀적으로 처리
      if (element.children.length > 0) {
        const lastChild = element.lastElementChild;
        if (lastChild) {
          removeBrFromElement(lastChild as HTMLElement);
        }
      }
      
      // 마지막 자식 노드들을 순회하면서 <br> 태그와 빈 <p><br></p> 제거
      while (element.lastChild) {
        const lastChild = element.lastChild;
        
        // 텍스트 노드인 경우 공백만 있으면 제거
        if (lastChild.nodeType === Node.TEXT_NODE) {
          const text = lastChild.textContent?.trim();
          if (!text) {
            element.removeChild(lastChild);
            continue;
          }
          break; // 실제 텍스트가 있으면 중단
        }
        
        // 요소 노드인 경우
        if (lastChild.nodeType === Node.ELEMENT_NODE) {
          const childElement = lastChild as HTMLElement;
          
          // <br> 또는 <br/> 태그인 경우 제거
          if (childElement.tagName === "BR") {
            element.removeChild(lastChild);
            continue;
          }
          
          // <p><br></p> 같은 빈 paragraph 태그 제거
          if (isEmptyParagraph(childElement)) {
            element.removeChild(lastChild);
            continue;
          }
          
          // 빈 <p> 태그인 경우 제거
          if (childElement.tagName === "P" && !childElement.textContent?.trim() && childElement.children.length === 0) {
            element.removeChild(lastChild);
            continue;
          }
          
          // 실제 콘텐츠가 있는 요소면 중단
          if (childElement.textContent?.trim() || childElement.children.length > 0) {
            break;
          }
        }
        
        break;
      }
    };
    
    // body에서 마지막 <br> 태그들 제거
    removeBrFromElement(body);
    
    return body.innerHTML;
  };

  const openPublishDialog = () => {
    if (!formData.title.trim()) {
      toast.error(t("editor.titleRequired"));
      return;
    }
    if (!formData.content.trim() || formData.content === "<p></p>") {
      toast.error(t("editor.contentRequired"));
      return;
    }
    if (!publishSlug.trim()) {
      setPublishSlug(generateSlug(formData.title));
    }
    setShowPublishDialog(true);
  };

  const handlePublish = async () => {
    if (!formData.title.trim()) {
      toast.error(t("editor.titleRequired"));
      return;
    }

    if (!publishSlug.trim()) {
      toast.error(t("editor.slugRequired"));
      return;
    }

    setIsPublishing(true);
    try {
      let status: "PUBLISHED" | "SCHEDULED" = "PUBLISHED";
      let scheduledAt: string | null = null;

      if (sendOption === "scheduled") {
        if (!scheduledDate || !scheduledTime) {
          toast.error(t("editor.scheduledDateRequired"));
          setIsPublishing(false);
          return;
        }
        status = "SCHEDULED";
        scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      }

      // 발행 전에 마지막 <br> 태그들 제거
      const cleanedContent = removeTrailingBrTags(formData.content);

      if (issueId && issueId !== "new") {
        const request: UpdateIssueRequest = {
          title: formData.title.trim(),
          slug: publishSlug.trim(),
          content: cleanedContent,
          status: status,
          scheduledAt: scheduledAt,
        };
        await updateIssue(newsletterId, issueId, request);
      } else {
        const request: CreateIssueRequest = {
          title: formData.title.trim(),
          slug: publishSlug.trim(),
          content: cleanedContent,
          status: status,
          scheduledAt: scheduledAt,
        };
        await createIssue(newsletterId, request);
      }

      if (status === "SCHEDULED") {
        toast.success(
          t("editor.scheduledSuccess")
            .replace("{date}", scheduledDate)
            .replace("{time}", scheduledTime)
        );
      } else {
        toast.success(t("editor.published"));
      }

      router.push(`/dashboard/newsletters/${newsletterId}/issues`);
    } catch (error: any) {
      console.error("Publish error:", error);
      const errorMessage = error.response?.data?.message || error.message || t("editor.publishFailed");
      toast.error(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPublishSlug(e.target.value);
  };

  const today = new Date().toISOString().split("T")[0];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">{t("common.loading")}</div>
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
            {t("editor.back")}
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="h-8"
          >
            {isSaving ? t("editor.saving") : t("editor.saveDraft")}
          </Button>
          <Button onClick={openPublishDialog} disabled={isPublishing} className="h-8">
            {t("editor.publish")}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative flex flex-1 overflow-hidden bg-muted/20">
        {/* Editor Section */}
        <div className="relative flex flex-1 flex-col border-r border-border/50 bg-background">
          {/* Title Input */}
          <div className="border-b border-border/50 bg-background px-8 py-6">
            <Input
              type="text"
              placeholder={t("editor.titlePlaceholder")}
              value={formData.title}
              onChange={handleTitleChange}
              className="border-0 bg-transparent px-0 text-3xl font-semibold leading-tight placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Preview Toggle Button (when hidden) - Preview Header와 같은 높이 */}
          {!showPreview && (
            <div className="absolute right-0 top-0 flex h-[57px] items-center border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-5">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-1 rounded p-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={t("editor.showPreview")}
              >
                <span className="text-xs font-medium">{t("editor.preview")}</span>
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          )}

          {/* Content Editor */}
          <div className="flex-1 overflow-auto px-8 py-6">
            <div className="mx-auto max-w-3xl">
              <ValityEditor
                content={formData.content}
                onChange={handleContentChange}
                placeholder={t("editor.slashPlaceholder")}
                issueId={issueId && issueId !== "new" ? issueId : undefined}
              />
            </div>
          </div>
        </div>


        {/* Preview Section */}
        {showPreview && (
          <div className="w-[480px] border-l border-border/50 bg-muted/20">
            <div className="sticky top-0 flex h-full flex-col">
              {/* Preview Header */}
              <div className="flex items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">{t("editor.preview")}</h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={t("editor.hidePreview")}
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
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
                    {t("editor.email")}
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
                    {t("editor.archive")}
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
                      noTitle={t("editor.noTitle")}
                      emailPreview={t("editor.email") + " " + t("editor.preview")}
                    />
                  ) : (
                    <ArchivePreview
                      title={formData.title}
                      content={formData.content}
                      author={user?.username || ""}
                      noTitle={t("editor.noTitle")}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("editor.publishSettings")}</DialogTitle>
            <DialogDescription>
              {t("editor.publishSettingsDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Email Notice */}
            <div className={cn(
              "rounded-lg border p-4",
              activeSubscriberCount > 0 
                ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950" 
                : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950"
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs",
                  activeSubscriberCount > 0 
                    ? "bg-blue-500 text-white" 
                    : "bg-amber-500 text-white"
                )}>
                  {activeSubscriberCount > 0 ? "✉" : "!"}
                </div>
                <p className={cn(
                  "text-sm",
                  activeSubscriberCount > 0 
                    ? "text-blue-800 dark:text-blue-200" 
                    : "text-amber-800 dark:text-amber-200"
                )}>
                  {activeSubscriberCount > 0
                    ? t("editor.emailNotice").replace("{count}", activeSubscriberCount.toString())
                    : t("editor.emailNoticeZero")}
                </p>
              </div>
            </div>
            {/* URL Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">{t("editor.urlSlug")}</Label>
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
                {t("editor.urlSlugHint")}
              </p>
            </div>

            {/* Send Timing */}
            <div className="space-y-3">
              <Label>{t("editor.publishTiming")}</Label>
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
                  <div className="font-medium">{t("editor.publishNow")}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {t("editor.publishNowDesc")}
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
                  <div className="font-medium">{t("editor.schedulePublish")}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {t("editor.schedulePublishDesc")}
                  </div>
                </button>
              </div>

              {sendOption === "scheduled" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="date">{t("editor.date")}</Label>
                    <Input
                      id="date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={today}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="time">{t("editor.time")}</Label>
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
              {t("common.cancel")}
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing
                ? t("editor.publishing")
                : sendOption === "scheduled"
                ? t("editor.schedulePublish")
                : t("editor.publish")}
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
  noTitle,
}: {
  title: string;
  content: string;
  author: string;
  noTitle: string;
}) {
  const locale = useAtomValue(localeAtom);
  const today = formatRelativeTime(new Date().toISOString(), locale);

  return (
    <div className="w-full max-w-[360px] rounded-lg border border-border bg-background shadow-sm">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-xl font-bold leading-tight">{title || noTitle}</h1>
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
  noTitle,
  emailPreview,
}: {
  title: string;
  content: string;
  newsletterName: string;
  noTitle: string;
  emailPreview: string;
}) {
  const locale = useAtomValue(localeAtom);
  const today = formatRelativeTime(new Date().toISOString(), locale);

  return (
    <div className="w-full max-w-[360px] rounded-lg border border-border bg-background shadow-sm">
      <div className="rounded-t-lg border-b border-border bg-muted/30 px-4 py-2">
        <p className="text-xs font-medium text-muted-foreground">{emailPreview}</p>
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

        <h1 className="mb-3 text-lg font-bold leading-tight">{title || noTitle}</h1>
        <div
          className="prose prose-sm prose-neutral max-w-none dark:prose-invert [&_img]:mx-auto [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
