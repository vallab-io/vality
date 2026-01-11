"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { getIssueById, updateIssue, type UpdateIssueRequest } from "@/lib/api/issue";
import { getNewsletterById, type Newsletter } from "@/lib/api/newsletter";
import { getSubscribers } from "@/lib/api/subscriber";
import { uploadIssueImage } from "@/lib/api/upload";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/auth.store";
import { localeAtom } from "@/stores/locale.store";
import { ValityEditor } from "@/components/editor/vality-editor";
import { useT } from "@/hooks/use-translation";
import { formatRelativeTime } from "@/lib/utils/date";
import { extractImageUrls } from "@/lib/utils/seo";
import { generateSlug } from "@/lib/utils/slug";

type PreviewMode = "archive" | "email";

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

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const [publishSlug, setPublishSlug] = useState("");
  const [publishExcerpt, setPublishExcerpt] = useState("");
  const [publishCoverImageUrl, setPublishCoverImageUrl] = useState("");
  const [generatedCoverImageUrl, setGeneratedCoverImageUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [issueStatus, setIssueStatus] = useState<"DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

        if (issueId) {
          const issueData = await getIssueById(newsletterId, issueId);
          setFormData({
            title: issueData.title || "",
            content: issueData.content,
          });
          const slug = issueData.slug || "";
          setPublishSlug(slug);
          setPublishExcerpt(issueData.excerpt || "");
          setPublishCoverImageUrl(issueData.coverImageUrl || "");
          setIssueStatus(issueData.status);
        }
      } catch (error: any) {
        console.error("Failed to load data:", error);
        toast.error(error.message || t("editor.loadFailed"));
        if (issueId) {
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

  const handleSaveDraft = useCallback(async () => {
    if (!formData.content.trim() || formData.content === "<p></p>") {
      toast.error(t("editor.contentRequired"));
      return;
    }

    setIsSaving(true);
    try {
      if (!issueId) {
        toast.error(t("editor.loadFailed"));
        return;
      }

      const request: UpdateIssueRequest = {
        title: formData.title.trim() || null,
        content: formData.content,
        status: "DRAFT",
      };
      await updateIssue(newsletterId, issueId, request);
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


  /**
   * Canvas를 사용하여 커버 이미지 생성 (1200x630)
   */
  const generateCoverImage = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // 배경 그라데이션
      const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
      gradient.addColorStop(0, "#F8FAFC");
      gradient.addColorStop(1, "#FFFFFF");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 630);

      // 제목 (중앙 상단)
      const title = formData.title || t("common.untitled");
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 64px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      
      // 제목이 너무 길면 줄바꿈
      const maxWidth = 1000;
      const titleLines = wrapText(ctx, title, maxWidth, 64);
      const titleY = 200;
      titleLines.forEach((line, index) => {
        ctx.fillText(line, 600, titleY + index * 80);
      });

      // 뉴스레터 이름 (하단 왼쪽)
      const newsletterName = newsletter?.name || "";
      if (newsletterName) {
        ctx.fillStyle = "#1e293b";
        ctx.font = "400 24px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(newsletterName, 60, 570);
      }

      // 날짜 (하단 오른쪽)
      const today = new Date();
      const dateStr = today.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      ctx.fillStyle = "#64748b";
      ctx.font = "400 20px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText(dateStr, 1140, 570);

      // Canvas를 Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create image blob"));
            return;
          }
          const url = URL.createObjectURL(blob);
          resolve(url);
        },
        "image/png",
        1.0
      );
    });
  };

  /**
   * 텍스트를 여러 줄로 나누기
   */
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    fontSize: number
  ): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + (currentLine ? " " : "") + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [text];
  };

  /**
   * 파일 선택하여 이미지 업로드
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !issueId) {
      return;
    }

    // 이미지 파일인지 확인
    if (!file.type.startsWith("image/")) {
      toast.error(t("editor.invalidImageFile"));
      return;
    }

    setIsUploadingImage(true);
    try {
      // S3에 업로드
      const uploadedUrl = await uploadIssueImage(issueId, file);
      
      // 업로드된 URL로 설정
      setUploadedImageUrl(uploadedUrl);
      setPublishCoverImageUrl(uploadedUrl);
      
      toast.success(t("editor.imageUploaded"));
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      toast.error(error.message || t("editor.imageUploadFailed"));
    } finally {
      setIsUploadingImage(false);
      // 파일 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const openPublishDialog = async () => {
    if (!formData.title.trim()) {
      toast.error(t("editor.titleRequired"));
      return;
    }
    if (!formData.content.trim() || formData.content === "<p></p>") {
      toast.error(t("editor.contentRequired"));
      return;
    }
    // status가 DRAFT일 때만 저장
    if (issueStatus === "DRAFT" && !isSaving && !isPublishing) {
      handleSaveDraft();
    }

    // publishSlug가 없거나 빈 문자열이면 제목 기반으로 자동 생성
    const currentSlug = publishSlug.trim();
    if (!currentSlug || currentSlug === "") {
      const autoSlug = generateSlug(formData.title);
      setPublishSlug(autoSlug);
    }

    // 이미 생성된 이미지가 없으면 자동으로 생성
    if (!generatedCoverImageUrl && !publishCoverImageUrl) {
      try {
        setIsGeneratingImage(true);
        const imageUrl = await generateCoverImage();
        setGeneratedCoverImageUrl(imageUrl);
        // 생성된 이미지를 자동으로 선택
        setPublishCoverImageUrl(imageUrl);
      } catch (error: any) {
        console.error("Failed to generate cover image:", error);
        // 이미지 생성 실패해도 다이얼로그는 열림
      } finally {
        setIsGeneratingImage(false);
      }
    }

    setShowPublishDialog(true);
  };

  /**
   * 이미 발행되어 있는 이슈를 업데이트 할 때
   */
  const handleUpdate = async () => {
    if (!formData.title.trim()) {
      toast.error(t("editor.titleRequired"));
      return;
    }

    if (!formData.content.trim() || formData.content === "<p></p>") {
      toast.error(t("editor.contentRequired"));
      return;
    }

    if (!issueId) {
      toast.error(t("editor.loadFailed"));
      return;
    }

    setIsPublishing(true);
    try {
      // 업데이트 전에 마지막 <br> 태그들 제거
      const cleanedContent = removeTrailingBrTags(formData.content);

      // slug가 없으면 기존 slug 유지 (PUBLISHED 상태에서는 이미 slug가 있어야 함)
      const slug = publishSlug.trim();
      if (!slug) {
        toast.error(t("editor.slugRequired"));
        setIsPublishing(false);
        return;
      }

      // Blob URL인 경우 먼저 업로드
      let finalCoverImageUrl = publishCoverImageUrl.trim() || null;
      if (finalCoverImageUrl && finalCoverImageUrl.startsWith("blob:")) {
        try {
          const response = await fetch(finalCoverImageUrl);
          const blob = await response.blob();
          const file = new File([blob], `cover-${slug}-${Date.now()}.png`, { type: "image/png" });
          finalCoverImageUrl = await uploadIssueImage(issueId, file);
          URL.revokeObjectURL(publishCoverImageUrl);
        } catch (uploadError: any) {
          console.error("Failed to upload cover image:", uploadError);
          toast.error(uploadError.message || t("editor.imageUploadFailed"));
          setIsPublishing(false);
          return;
        }
      }

      const updateRequest: UpdateIssueRequest = {
        title: formData.title.trim(),
        slug: slug,
        content: cleanedContent,
        excerpt: publishExcerpt.trim() || null,
        coverImageUrl: finalCoverImageUrl,
        status: "PUBLISHED",
        scheduledAt: null,
      };
      await updateIssue(newsletterId, issueId, updateRequest);

      toast.success(t("editor.updated"));

      router.push(`/dashboard/newsletters/${newsletterId}/issues`);
    } catch (error: any) {
      console.error("Update error:", error);
      const errorMessage = error.response?.data?.message || error.message || t("editor.updateFailed");
      toast.error(errorMessage);
    } finally {
      setIsPublishing(false);
    }
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
      // 발행 전에 마지막 <br> 태그들 제거
      const cleanedContent = removeTrailingBrTags(formData.content);
      const slug = publishSlug.trim();

      if (!issueId) {
        toast.error(t("editor.loadFailed"));
        return;
      }

      // Blob URL인 경우 먼저 업로드
      let finalCoverImageUrl = publishCoverImageUrl.trim() || null;
      if (finalCoverImageUrl && finalCoverImageUrl.startsWith("blob:")) {
        try {
          const response = await fetch(finalCoverImageUrl);
          const blob = await response.blob();
          const file = new File([blob], `cover-${slug}-${Date.now()}.png`, { type: "image/png" });
          finalCoverImageUrl = await uploadIssueImage(issueId, file);
          URL.revokeObjectURL(publishCoverImageUrl);
        } catch (uploadError: any) {
          console.error("Failed to upload cover image:", uploadError);
          toast.error(uploadError.message || t("editor.imageUploadFailed"));
          setIsPublishing(false);
          return;
        }
      }

      // 그 다음 PUBLISHED로 업데이트
      const publishRequest: UpdateIssueRequest = {
        title: formData.title.trim(),
        slug: slug,
        content: cleanedContent,
        excerpt: publishExcerpt.trim() || null,
        coverImageUrl: finalCoverImageUrl,
        status: "PUBLISHED",
        scheduledAt: null,
      };
      await updateIssue(newsletterId, issueId, publishRequest);

      toast.success(t("editor.published"));

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
          {issueStatus === "DRAFT" && (
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="h-8"
            >
              {isSaving ? t("editor.saving") : t("editor.saveDraft")}
            </Button>
          )}
          {issueStatus === "PUBLISHED" ? (
            <Button onClick={handleUpdate} disabled={isPublishing} className="h-8">
              {isPublishing ? t("editor.updating") : t("editor.update")}
            </Button>
          ) : (
            <Button onClick={openPublishDialog} disabled={isPublishing} className="h-8">
              {t("editor.publish")}
            </Button>
          )}
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
                issueId={issueId}
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

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">{t("editor.excerpt")}</Label>
              <Textarea
                id="excerpt"
                value={publishExcerpt}
                onChange={(e) => setPublishExcerpt(e.target.value)}
                placeholder={t("editor.excerptPlaceholder")}
                rows={3}
                className="resize-none overflow-y-auto"
                style={{ maxHeight: "calc(3 * 1.5rem + 1rem + 2px)" }}
              />
            </div>

            {/* Cover Image Selection */}
            <div className="space-y-4">
              <div>
                <Label>{t("editor.coverImage")}</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("editor.coverImageHint")} {t("editor.coverImageRecommendedSize")}
                </p>
              </div>

              {/* 이미지 업로드 버튼 */}
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage || !issueId}
                  className="w-full"
                >
                  {isUploadingImage ? t("editor.uploading") : t("editor.uploadImage")}
                </Button>
              </div>

              {/* 이미지 선택 옵션들 - 한 row로 통합 */}
              {(() => {
                const imageUrls = extractImageUrls(formData.content);
                const allImages: Array<{ url: string; type: "content" | "generated" | "uploaded" }> = [];
                
                // Content 이미지 추가
                imageUrls.forEach(url => {
                  allImages.push({ url, type: "content" });
                });
                
                // 생성된 이미지 추가
                if (generatedCoverImageUrl) {
                  allImages.push({ url: generatedCoverImageUrl, type: "generated" });
                }

                // 업로드된 이미지 추가
                if (uploadedImageUrl) {
                  allImages.push({ url: uploadedImageUrl, type: "uploaded" });
                }

                if (allImages.length === 0 && !isGeneratingImage) {
                  return null;
                }

                return (
                  <div className="space-y-3">
                    {/* 이미지 생성 중 표시 */}
                    {isGeneratingImage && (
                      <div className="flex items-center justify-center rounded-lg border border-border bg-muted/30 p-8">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">
                            {t("editor.generatingImage")}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 모든 이미지를 한 row로 표시 */}
                    {allImages.length > 0 && (
                      <div className="space-y-2">
                        <div className="overflow-x-auto pb-2">
                          <div className="flex gap-3 min-w-max">
                            {allImages.map((image, index) => (
                              <button
                                key={`${image.type}-${index}`}
                                type="button"
                                onClick={() => setPublishCoverImageUrl(image.url)}
                                className={cn(
                                  "group relative aspect-[1200/630] w-32 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                                  publishCoverImageUrl === image.url
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <img
                                  src={image.url}
                                  alt={
                                    image.type === "generated" 
                                      ? "Generated cover" 
                                      : image.type === "uploaded"
                                      ? "Uploaded cover"
                                      : `Image ${index + 1}`
                                  }
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                                {publishCoverImageUrl === image.url && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                                    <div className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                                      {t("editor.selected")}
                                    </div>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
              
              {/* 선택된 이미지 큰 미리보기 */}
              {publishCoverImageUrl && !isGeneratingImage && (
                <div className="space-y-2">
                  <Label className="text-sm">{t("editor.preview")}</Label>
                  <div className="relative aspect-[1200/630] overflow-hidden rounded-lg border border-border bg-muted">
                    <img
                      src={publishCoverImageUrl}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="flex h-full items-center justify-center text-sm text-muted-foreground">${t("editor.imageLoadFailed")}</div>`;
                        }
                      }}
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
            <Button onClick={handlePublish} disabled={isPublishing || !publishSlug.trim()}>
              {isPublishing ? t("editor.publishing") : t("editor.publish")}
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
