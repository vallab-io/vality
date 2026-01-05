"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createNewsletter } from "@/lib/api/newsletter";
import { getErrorMessage } from "@/lib/api/client";
import { userAtom } from "@/stores/auth.store";
import { useT } from "@/hooks/use-translation";
import { useAtomValue as useAtom } from "jotai";
import { localeAtom } from "@/stores/locale.store";
import { TIMEZONES, getBrowserTimezone } from "@/lib/utils/timezone";

interface NewsletterSetupFormProps {
  onComplete: () => void;
}

export function NewsletterSetupForm({
  onComplete,
}: NewsletterSetupFormProps) {
  const t = useT();
  const user = useAtomValue(userAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  
  // 브라우저 timezone으로 기본 timezone 설정
  const defaultTimezone = (() => {
    const browserTimezone = getBrowserTimezone();
    // TIMEZONES에 있는 timezone인지 확인
    const isValidTimezone = TIMEZONES.some(tz => tz.value === browserTimezone);
    return isValidTimezone ? browserTimezone : "Asia/Seoul";
  })();
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    timezone: defaultTimezone,
  });

  // Slug 유효성 검증
  useEffect(() => {
    const slug = formData.slug.trim();
    if (!slug) {
      setSlugError(null);
      return;
    }

    if (slug.length < 3) {
      setSlugError(t("onboarding.slugMinLength"));
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(slug)) {
      setSlugError(t("onboarding.slugInvalid"));
      return;
    }

    setSlugError(null);
  }, [formData.slug, t]);

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
      toast.error(t("onboarding.enterNewsletterName"));
      return;
    }

    if (!formData.slug) {
      toast.error(t("onboarding.enterSlug"));
      return;
    }

    if (formData.slug.length < 3) {
      toast.error(t("onboarding.slugMinLength"));
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
        timezone: formData.timezone,
      });

      toast.success(t("onboarding.newsletterCreated"));
      onComplete();
    } catch (error) {
      console.error("Create newsletter error:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage || t("onboarding.createFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 뉴스레터 이름 */}
      <div className="space-y-2">
        <Label htmlFor="name">
          {t("onboarding.newsletterName")} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder={t("onboarding.newsletterNamePlaceholder")}
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          className="h-11"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          {t("onboarding.newsletterNameHint")}
        </p>
      </div>

      {/* 슬러그 */}
      <div className="space-y-2">
        <Label htmlFor="slug">
          {t("onboarding.slug")} <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-0 rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 has-[:focus]:border-ring">
          <span className="px-3 py-2 text-muted-foreground whitespace-nowrap border-r border-input">
            vality.io/@{user?.username || "username"}/
          </span>
          <Input
            id="slug"
            name="slug"
            type="text"
            placeholder={t("onboarding.slugPlaceholder")}
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
            {t("onboarding.slugAvailable")}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t("onboarding.slugHint")}
          </p>
        )}
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label htmlFor="description">{t("onboarding.newsletterDescOptional")}</Label>
        <Textarea
          id="description"
          name="description"
          placeholder={t("onboarding.newsletterDescPlaceholder")}
          value={formData.description}
          onChange={handleChange}
          disabled={isLoading}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Timezone 선택 */}
      <div className="space-y-2">
        <Label htmlFor="timezone">
          {t("settings.timezone")} <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.timezone}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, timezone: value }))}
          disabled={isLoading}
        >
          <SelectTrigger id="timezone" className="h-11">
            <SelectValue placeholder={t("settings.timezoneSelect")} />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                <span className="flex items-center gap-2">
                  <span>{tz.label}</span>
                  <span className="text-muted-foreground text-xs">
                    {tz.offset}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {t("settings.timezoneHint")}
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
          !formData.timezone ||
          !!slugError
        }
      >
        {isLoading ? t("onboarding.creating") : t("onboarding.createNewsletter")}
      </Button>
    </form>
  );
}
