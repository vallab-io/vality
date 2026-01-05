"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { getNewsletterById, updateNewsletter } from "@/lib/api/newsletter";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/auth.store";
import { useT } from "@/hooks/use-translation";
import { TIMEZONES } from "@/lib/utils/timezone";

export default function NewsletterSettingsPage() {
  const params = useParams();
  const newsletterId = params.newsletterId as string;
  const user = useAtomValue(userAtom);
  const t = useT();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    timezone: "",
  });

  // 뉴스레터 데이터 가져오기
  useEffect(() => {
    const fetchNewsletter = async () => {
      try {
        setIsFetching(true);
        const newsletter = await getNewsletterById(newsletterId);
        setFormData({
          name: newsletter.name,
          slug: newsletter.slug,
          description: newsletter.description || "",
          timezone: newsletter.timezone,
        });
      } catch (error) {
        console.error("Failed to fetch newsletter:", error);
        toast.error(t("settings.newsletterLoadFailed"));
      } finally {
        setIsFetching(false);
      }
    };

    if (newsletterId) {
      fetchNewsletter();
    }
  }, [newsletterId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // slug는 영문, 숫자, 하이픈만 허용
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData((prev) => ({ ...prev, slug: value }));
  };

  const handleTimezoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, timezone: value }));
  };

  // Subscribe Widget - Coming Soon
  // const embedCode = `<iframe
  //   src="https://vality.io/@${user?.username || "username"}/${formData.slug}/subscribe-widget"
  //   width="100%"
  //   height="220"
  //   style="border:1px solid #e5e5e5; border-radius:12px;"
  //   title="Subscribe to ${formData.name}"
  // ></iframe>`;

  // const handleCopyEmbed = async () => {
  //   try {
  //     await navigator.clipboard.writeText(embedCode);
  //     toast.success(t("settings.codeCopied"));
  //   } catch (error) {
  //     console.error("Copy embed error:", error);
  //     toast.error(t("settings.copyFailed"));
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedNewsletter = await updateNewsletter(newsletterId, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        timezone: formData.timezone,
      });
      
      // 업데이트된 데이터로 폼 데이터 갱신
      setFormData({
        name: updatedNewsletter.name,
        slug: updatedNewsletter.slug,
        description: updatedNewsletter.description || "",
        timezone: updatedNewsletter.timezone,
      });
      
      toast.success(t("settings.newsletterSaved"));
    } catch (error: any) {
      console.error("Newsletter settings update error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || t("settings.newsletterSaveFailed");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="space-y-6">
        {/* Basic Info Section */}
        <section className="rounded-lg border border-border">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-medium">{t("settings.basicInfo")}</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Newsletter Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">{t("settings.newsletterName")}</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("settings.newsletterNamePlaceholder")}
                disabled={isLoading || isFetching}
              />
            </div>

            {/* Slug */}
            <div className="grid gap-2">
              <Label htmlFor="slug">{t("settings.urlSlug")}</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                  /@{user?.username || "username"}/
                </span>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder={t("settings.urlSlugPlaceholder")}
                  disabled={isLoading || isFetching}
                  className="rounded-l-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                vality.io/@{user?.username || "username"}/{formData.slug || "slug"}
              </p>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">{t("settings.newsletterDescription")}</Label>
                <span className="text-xs text-muted-foreground">
                  {formData.description.length}/300
                </span>
              </div>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t("settings.newsletterDescPlaceholder")}
                disabled={isLoading || isFetching}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading || isFetching}>
                {isLoading ? t("settings.saving") : t("settings.saveChanges")}
              </Button>
            </div>
          </form>
        </section>

        {/* Email Settings Section */}
        <section className="rounded-lg border border-border">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-medium">{t("settings.emailSettings")}</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Timezone */}
            <div className="grid gap-2">
              <Label htmlFor="timezone">{t("settings.timezone")}</Label>
              <Select
                value={formData.timezone}
                onValueChange={handleTimezoneChange}
                disabled={isLoading || isFetching}
              >
                <SelectTrigger id="timezone">
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

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={isLoading || isFetching}
              >
                {isLoading ? t("settings.saving") : t("settings.saveChanges")}
              </Button>
            </div>
          </div>
        </section>

        {/* Subscribe Widget Section - Coming Soon
        <section className="rounded-lg border border-border">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-medium">{t("settings.subscribeWidget")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("settings.subscribeWidgetDesc")}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t("settings.embedCode")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("settings.embedCodeDesc")}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyEmbed}>
                {t("settings.copyCode")}
              </Button>
            </div>

            <Textarea
              value={embedCode}
              readOnly
              className="min-h-[160px] font-mono text-xs"
            />
          </div>
        </section>
        */}
      </div>
    </div>
  );
}
