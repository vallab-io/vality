"use client";

import { useState, useRef, useCallback } from "react";
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

// 목업 뉴스레터 데이터
const MOCK_NEWSLETTER = {
  id: "clh1abc123def456ghi789",
  name: "John's Weekly",
  slug: "weekly",
};

const MOCK_USER = {
  username: "johndoe",
};

// 목업 구독자 데이터
const MOCK_SUBSCRIBERS = [
  { id: "1", email: "alice@example.com", status: "active" },
  { id: "2", email: "bob@example.com", status: "active" },
  { id: "3", email: "charlie@example.com", status: "active" },
  { id: "4", email: "diana@example.com", status: "active" },
  { id: "5", email: "eve@example.com", status: "active" },
];

type PreviewMode = "blog" | "email";

export default function NewIssuePage() {
  const params = useParams();
  const router = useRouter();
  const newsletterId = params.newsletterId as string;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewMode, setPreviewMode] = useState<PreviewMode>("email");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const [publishSlug, setPublishSlug] = useState("");

  const activeSubscribers = MOCK_SUBSCRIBERS.filter(
    (s) => s.status === "active"
  );

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, content: e.target.value }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
    setPublishSlug(value);
  };

  // 툴바 기능: 선택된 텍스트에 포맷 적용
  const insertFormat = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const beforeText = formData.content.substring(0, start);
    const afterText = formData.content.substring(end);

    const newContent = beforeText + prefix + selectedText + suffix + afterText;
    setFormData((prev) => ({ ...prev, content: newContent }));

    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 0);
  };

  // 툴바 기능: 줄 시작에 포맷 적용
  const insertLineFormat = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const content = formData.content;
    
    // 현재 줄의 시작 위치 찾기
    let lineStart = start;
    while (lineStart > 0 && content[lineStart - 1] !== "\n") {
      lineStart--;
    }

    const beforeLine = content.substring(0, lineStart);
    const afterStart = content.substring(lineStart);

    const newContent = beforeLine + prefix + afterStart;
    setFormData((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = useCallback(
    async (file: File) => {
      // 파일 유효성 검사
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("JPG, PNG, GIF, WEBP 형식만 업로드 가능합니다.");
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("이미지 크기는 5MB 이하여야 합니다.");
        return;
      }

      setIsUploading(true);
      try {
        // TODO: 실제 API 연동
        // const formData = new FormData();
        // formData.append("file", file);
        // const response = await fetch("/api/upload", { method: "POST", body: formData });
        // const { url } = await response.json();

        // 목업: 로컬 URL 생성 (실제로는 서버 URL)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const mockUrl = URL.createObjectURL(file);

        // 커서 위치에 이미지 마크다운 삽입
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const beforeText = formData.content.substring(0, start);
          const afterText = formData.content.substring(start);
          const imageMarkdown = `![${file.name}](${mockUrl})`;

          setFormData((prev) => ({
            ...prev,
            content: beforeText + imageMarkdown + afterText,
          }));

          // 커서 위치 조정
          setTimeout(() => {
            textarea.focus();
            const newPosition = start + imageMarkdown.length;
            textarea.setSelectionRange(newPosition, newPosition);
          }, 0);
        }

        toast.success("이미지가 업로드되었습니다.");
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error("이미지 업로드에 실패했습니다.");
      } finally {
        setIsUploading(false);
      }
    },
    [formData.content]
  );

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // input 초기화 (같은 파일 다시 선택 가능하도록)
    e.target.value = "";
  };

  // 드래그 앤 드롭 핸들러
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 클립보드 붙여넣기 핸들러
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            handleImageUpload(file);
          }
          break;
        }
      }
    },
    [handleImageUpload]
  );

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      console.log("Save draft:", { newsletterId, ...formData });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("임시저장되었습니다.");
    } catch (error) {
      console.error("Save draft error:", error);
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const openPublishDialog = () => {
    if (!formData.title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!formData.content.trim()) {
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
      console.log("Publish:", {
        newsletterId,
        ...formData,
        slug: publishSlug,
        sendEmail,
        recipientCount: sendEmail ? activeSubscribers.length : 0,
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (sendEmail) {
        toast.success(
          `발행 완료! ${activeSubscribers.length}명에게 이메일을 발송했습니다.`
        );
      } else {
        toast.success("발행되었습니다! (이메일 발송 없음)");
      }

      router.push(`/dashboard/newsletters/${newsletterId}/issues`);
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("발행에 실패했습니다.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
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

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 border-b border-border px-4 py-2">
            {/* Headings */}
            <ToolbarButton onClick={() => insertLineFormat("# ")} title="제목 1">
              H<sub>1</sub>
            </ToolbarButton>
            <ToolbarButton onClick={() => insertLineFormat("## ")} title="제목 2">
              H<sub>2</sub>
            </ToolbarButton>
            <ToolbarButton onClick={() => insertLineFormat("### ")} title="제목 3">
              H<sub>3</sub>
            </ToolbarButton>
            <ToolbarButton onClick={() => insertLineFormat("#### ")} title="제목 4">
              H<sub>4</sub>
            </ToolbarButton>

            <div className="mx-2 h-5 w-px bg-border" />

            {/* Text Formatting */}
            <ToolbarButton onClick={() => insertFormat("**")} title="굵게">
              <span className="font-bold">B</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => insertFormat("*")} title="기울임">
              <span className="italic">I</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => insertFormat("~~")} title="취소선">
              <span className="line-through">S</span>
            </ToolbarButton>

            <div className="mx-2 h-5 w-px bg-border" />

            {/* Quote */}
            <ToolbarButton onClick={() => insertLineFormat("> ")} title="인용">
              <QuoteIcon className="h-4 w-4" />
            </ToolbarButton>

            {/* List */}
            <ToolbarButton onClick={() => insertLineFormat("- ")} title="목록">
              <ListIcon className="h-4 w-4" />
            </ToolbarButton>

            <div className="mx-2 h-5 w-px bg-border" />

            {/* Link */}
            <ToolbarButton
              onClick={() => insertFormat("[", "](url)")}
              title="링크"
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>

            {/* Image */}
            <ToolbarButton
              onClick={handleImageButtonClick}
              title="이미지 업로드"
              disabled={isUploading}
            >
              {isUploading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
            </ToolbarButton>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Code */}
            <ToolbarButton onClick={() => insertFormat("`")} title="인라인 코드">
              <CodeIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Content Editor */}
          <div
            className="flex-1 overflow-auto p-4"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <textarea
              ref={textareaRef}
              value={formData.content}
              onChange={handleContentChange}
              onPaste={handlePaste}
              placeholder="내용을 입력하세요... (이미지를 드래그하거나 붙여넣기 가능)"
              className="h-full w-full resize-none bg-transparent text-base leading-relaxed outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex w-1/2 flex-col bg-muted/30">
          {/* Preview Header */}
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
                블로그
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

          {/* Preview Content */}
          <div className="flex-1 overflow-auto p-6">
            {formData.content ? (
              previewMode === "blog" ? (
                <BlogPreview
                  title={formData.title}
                  content={formData.content}
                  author={MOCK_USER.username}
                />
              ) : (
                <EmailPreview
                  title={formData.title}
                  content={formData.content}
                  newsletterName={MOCK_NEWSLETTER.name}
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

      {/* Bottom Bar */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
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
            출간하기
          </Button>
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
            <div className="space-y-2">
              <Label htmlFor="slug">URL 슬러그</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  /@{MOCK_USER.username}/{MOCK_NEWSLETTER.slug}/
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

            <div className="rounded-lg border border-border p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="font-medium">구독자에게 이메일 발송</span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeSubscribers.length}명의 활성 구독자에게 이메일이
                    발송됩니다.
                  </p>
                </div>
              </label>

              {sendEmail && (
                <div className="mt-4 rounded-lg bg-muted/50 p-3">
                  <p className="text-sm font-medium">발송 대상</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {activeSubscribers.slice(0, 5).map((sub) => (
                      <span
                        key={sub.id}
                        className="rounded bg-background px-2 py-0.5 text-xs"
                      >
                        {sub.email}
                      </span>
                    ))}
                    {activeSubscribers.length > 5 && (
                      <span className="rounded bg-background px-2 py-0.5 text-xs text-muted-foreground">
                        외 {activeSubscribers.length - 5}명
                      </span>
                    )}
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
                : sendEmail
                ? "발행 및 이메일 발송"
                : "발행하기"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 툴바 버튼 컴포넌트
function ToolbarButton({
  children,
  onClick,
  title,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

// 아이콘 컴포넌트들
function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179z" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21,15 16,10 5,21" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16,18 22,12 16,6" />
      <polyline points="8,6 2,12 8,18" />
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
        <h1 className="text-3xl font-bold">
          {title || "제목을 입력하세요"}
        </h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <span>@{author}</span>
          <span>·</span>
          <time>{today}</time>
        </div>
      </header>
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        {renderMarkdown(content)}
      </article>
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
              <p className="text-xs text-muted-foreground">
                newsletter@vality.io
              </p>
            </div>
          </div>
          <div className="mt-3">
            <p className="font-semibold">{title || "제목을 입력하세요"}</p>
            <p className="text-xs text-muted-foreground">{today}</p>
          </div>
        </div>

        <div className="p-6">
          <article className="prose prose-sm prose-neutral max-w-none dark:prose-invert">
            {renderMarkdown(content)}
          </article>
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

// 마크다운 렌더러
function renderMarkdown(content: string) {
  return content.split("\n").map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) return <br key={index} />;

    // Heading 1
    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={index} className="mt-8 mb-4 text-3xl font-bold">
          {trimmed.replace("# ", "")}
        </h1>
      );
    }

    // Heading 2
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={index} className="mt-8 mb-4 text-2xl font-semibold">
          {trimmed.replace("## ", "")}
        </h2>
      );
    }

    // Heading 3
    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={index} className="mt-6 mb-3 text-xl font-semibold">
          {trimmed.replace("### ", "")}
        </h3>
      );
    }

    // Heading 4
    if (trimmed.startsWith("#### ")) {
      return (
        <h4 key={index} className="mt-4 mb-2 text-lg font-semibold">
          {trimmed.replace("#### ", "")}
        </h4>
      );
    }

    // Bold list item
    if (trimmed.startsWith("- **")) {
      const match = trimmed.match(/- \*\*(.+?)\*\*:?\s*(.*)$/);
      if (match) {
        return (
          <li key={index} className="ml-4 my-1">
            <strong>{match[1]}</strong>
            {match[2] && `: ${match[2]}`}
          </li>
        );
      }
    }

    // Regular list item
    if (trimmed.startsWith("- ")) {
      return (
        <li key={index} className="ml-4 my-1">
          {renderInlineMarkdown(trimmed.replace("- ", ""))}
        </li>
      );
    }

    // Numbered list
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      return (
        <li key={index} className="ml-4 my-1 list-decimal">
          {renderInlineMarkdown(numberedMatch[2])}
        </li>
      );
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      return (
        <blockquote
          key={index}
          className="border-l-4 border-primary/30 pl-4 my-4 italic text-muted-foreground"
        >
          {trimmed.replace("> ", "")}
        </blockquote>
      );
    }

    // Regular paragraph
    return (
      <p key={index} className="my-4 leading-relaxed">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });
}

function renderInlineMarkdown(text: string) {
  let parts: (string | React.ReactNode)[] = [text];

  // Links: [text](url)
  parts = parts.flatMap((part, i) => {
    if (typeof part !== "string") return part;
    return part.split(/(\[[^\]]+\]\([^)]+\))/g).map((segment, j) => {
      const linkMatch = segment.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        return (
          <a
            key={`${i}-link-${j}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return segment;
    });
  });

  // Images: ![alt](url)
  parts = parts.flatMap((part, i) => {
    if (typeof part !== "string") return part;
    return part.split(/(!\[[^\]]*\]\([^)]+\))/g).map((segment, j) => {
      const imgMatch = segment.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (imgMatch) {
        return (
          <img
            key={`${i}-img-${j}`}
            src={imgMatch[2]}
            alt={imgMatch[1] || "이미지"}
            className="my-4 max-w-full rounded-lg"
          />
        );
      }
      return segment;
    });
  });

  // Strikethrough: ~~text~~
  parts = parts.flatMap((part, i) => {
    if (typeof part !== "string") return part;
    return part.split(/(~~[^~]+~~)/g).map((segment, j) => {
      if (segment.startsWith("~~") && segment.endsWith("~~")) {
        return <del key={`${i}-s-${j}`}>{segment.slice(2, -2)}</del>;
      }
      return segment;
    });
  });

  // Bold: **text**
  parts = parts.flatMap((part, i) => {
    if (typeof part !== "string") return part;
    return part.split(/(\*\*[^*]+\*\*)/g).map((segment, j) => {
      if (segment.startsWith("**") && segment.endsWith("**")) {
        return <strong key={`${i}-b-${j}`}>{segment.slice(2, -2)}</strong>;
      }
      return segment;
    });
  });

  // Italic: *text*
  parts = parts.flatMap((part, i) => {
    if (typeof part !== "string") return part;
    return part.split(/(\*[^*]+\*)/g).map((segment, j) => {
      if (segment.startsWith("*") && segment.endsWith("*") && !segment.startsWith("**")) {
        return <em key={`${i}-i-${j}`}>{segment.slice(1, -1)}</em>;
      }
      return segment;
    });
  });

  // Inline code: `code`
  parts = parts.flatMap((part, i) => {
    if (typeof part !== "string") return part;
    return part.split(/(`[^`]+`)/g).map((segment, j) => {
      if (segment.startsWith("`") && segment.endsWith("`")) {
        return (
          <code
            key={`${i}-c-${j}`}
            className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono"
          >
            {segment.slice(1, -1)}
          </code>
        );
      }
      return segment;
    });
  });

  return parts;
}
