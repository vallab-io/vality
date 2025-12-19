"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createNewsletter } from "@/lib/api/newsletter";
import { getErrorMessage } from "@/lib/api/client";
import { userAtom } from "@/stores/auth.store";

interface NewsletterSetupFormProps {
  onComplete: () => void;
}

export function NewsletterSetupForm({
  onComplete,
}: NewsletterSetupFormProps) {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    senderName: "",
  });

  // Slug 자동 생성 (name 기반)
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const autoSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s]/g, "") // 특수문자 제거
        .replace(/\s+/g, "-") // 공백을 하이픈으로
        .replace(/[가-힣]/g, "") // 한글 제거
        .substring(0, 50); // 최대 50자
      setFormData((prev) => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.name]);

  // Slug 유효성 검증
  useEffect(() => {
    const slug = formData.slug.trim();
    if (!slug) {
      setSlugError(null);
      return;
    }

    if (slug.length < 3) {
      setSlugError("슬러그는 3자 이상이어야 합니다.");
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(slug)) {
      setSlugError("영문 소문자, 숫자, 하이픈(-), 언더스코어(_)만 사용할 수 있습니다.");
      return;
    }

    setSlugError(null);
  }, [formData.slug]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 영문 소문자, 숫자, 하이픈, 언더스코어만 허용
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setFormData((prev) => ({ ...prev, slug: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("뉴스레터 이름을 입력해주세요.");
      return;
    }

    if (!formData.slug) {
      toast.error("슬러그를 입력해주세요.");
      return;
    }

    if (formData.slug.length < 3) {
      toast.error("슬러그는 3자 이상이어야 합니다.");
      return;
    }

    if (slugError) {
      toast.error(slugError);
      return;
    }

    setIsLoading(true);

    try {
      await createNewsletter({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        senderName: formData.senderName || undefined,
      });

      toast.success("뉴스레터가 생성되었습니다!");
      onComplete();
    } catch (error) {
      console.error("Create newsletter error:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage || "뉴스레터 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 뉴스레터 이름 */}
      <div className="space-y-2">
        <Label htmlFor="name">
          뉴스레터 이름 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="예: 내 주간 뉴스레터"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          className="h-11"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          뉴스레터의 이름을 입력하세요. 나중에 변경할 수 있습니다.
        </p>
      </div>

      {/* 슬러그 */}
      <div className="space-y-2">
        <Label htmlFor="slug">
          URL 슬러그 <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-0 rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 has-[:focus]:border-ring">
          <span className="px-3 py-2 text-muted-foreground whitespace-nowrap border-r border-input">
            vality.io/@{user?.username || "username"}/
          </span>
          <Input
            id="slug"
            name="slug"
            type="text"
            placeholder="my-newsletter"
            value={formData.slug}
            onChange={handleSlugChange}
            disabled={isLoading}
            className={`h-9 flex-1 border-0 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0 ${slugError ? "text-destructive" : ""}`}
          />
        </div>
        {slugError ? (
          <p className="text-xs text-destructive">{slugError}</p>
        ) : formData.slug.length >= 3 && !slugError ? (
          <p className="text-xs text-[#2563EB] dark:text-[#38BDF8]">
            사용 가능한 슬러그입니다.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            영문 소문자, 숫자, 하이픈(-), 언더스코어(_)만 사용할 수 있습니다.
          </p>
        )}
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label htmlFor="description">뉴스레터 설명 (선택)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="뉴스레터에 대해 간단히 설명해주세요"
          value={formData.description}
          onChange={handleChange}
          disabled={isLoading}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* 발신자 이름 */}
      <div className="space-y-2">
        <Label htmlFor="senderName">발신자 이름 (선택)</Label>
        <Input
          id="senderName"
          name="senderName"
          type="text"
          placeholder="예: 홍길동"
          value={formData.senderName}
          onChange={handleChange}
          disabled={isLoading}
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">
          이메일 발송 시 발신자 이름으로 표시됩니다.
        </p>
      </div>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        className="h-11 w-full"
        disabled={
          isLoading ||
          !formData.name ||
          !formData.slug ||
          formData.slug.length < 3 ||
          !!slugError
        }
      >
        {isLoading ? "생성 중..." : "뉴스레터 만들기"}
      </Button>
    </form>
  );
}

