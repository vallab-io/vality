"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/common";
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

// 주요 Timezone 목록 (IANA timezone format)
const TIMEZONES = [
  { value: "Asia/Seoul", label: "Asia/Seoul", offset: "GMT+09:00" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo", offset: "GMT+09:00" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai", offset: "GMT+08:00" },
  { value: "Asia/Singapore", label: "Asia/Singapore", offset: "GMT+08:00" },
  { value: "Asia/Hong_Kong", label: "Asia/Hong_Kong", offset: "GMT+08:00" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok", offset: "GMT+07:00" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata", offset: "GMT+05:30" },
  { value: "Asia/Dubai", label: "Asia/Dubai", offset: "GMT+04:00" },
  { value: "Europe/London", label: "Europe/London", offset: "GMT+00:00" },
  { value: "Europe/Paris", label: "Europe/Paris", offset: "GMT+01:00" },
  { value: "Europe/Berlin", label: "Europe/Berlin", offset: "GMT+01:00" },
  { value: "America/New_York", label: "America/New_York", offset: "GMT-05:00" },
  { value: "America/Chicago", label: "America/Chicago", offset: "GMT-06:00" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles", offset: "GMT-08:00" },
  { value: "Pacific/Honolulu", label: "Pacific/Honolulu", offset: "GMT-10:00" },
  { value: "Australia/Sydney", label: "Australia/Sydney", offset: "GMT+11:00" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland", offset: "GMT+13:00" },
];

export default function NewsletterSettingsPage() {
  const params = useParams();
  const newsletterId = params.newsletterId as string;
  const user = useAtomValue(userAtom);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    senderName: "",
    timezone: "Asia/Seoul",
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
          senderName: newsletter.senderName || "",
          timezone: newsletter.timezone,
        });
      } catch (error) {
        console.error("Failed to fetch newsletter:", error);
        toast.error("뉴스레터 정보를 불러오는데 실패했습니다.");
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

  const embedCode = `<iframe
    src="https://vality.io/@${user?.username || "username"}/${formData.slug}/subscribe-widget"
    width="100%"
    height="220"
    style="border:1px solid #e5e5e5; border-radius:12px;"
    title="Subscribe to ${formData.name}"
  ></iframe>`;

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      toast.success("임베드 코드가 복사되었습니다.");
    } catch (error) {
      console.error("Copy embed error:", error);
      toast.error("복사에 실패했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedNewsletter = await updateNewsletter(newsletterId, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        senderName: formData.senderName || undefined,
        timezone: formData.timezone,
      });
      
      // 업데이트된 데이터로 폼 데이터 갱신
      setFormData({
        name: updatedNewsletter.name,
        slug: updatedNewsletter.slug,
        description: updatedNewsletter.description || "",
        senderName: updatedNewsletter.senderName || "",
        timezone: updatedNewsletter.timezone,
      });
      
      toast.success("뉴스레터 설정이 저장되었습니다.");
    } catch (error: any) {
      console.error("Newsletter settings update error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "설정 저장에 실패했습니다.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="뉴스레터 설정" />
        <div className="mt-8 flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="뉴스레터 설정" />

      <div className="mt-8 space-y-6">
        {/* Basic Info Section */}
        <section className="rounded-lg border border-border">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-medium">기본 정보</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Newsletter Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">뉴스레터 이름</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="뉴스레터 이름"
                disabled={isLoading || isFetching}
              />
            </div>

            {/* Slug */}
            <div className="grid gap-2">
              <Label htmlFor="slug">URL 슬러그</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                  /@{user?.username || "username"}/
                </span>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="newsletter-slug"
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
                <Label htmlFor="description">설명</Label>
                <span className="text-xs text-muted-foreground">
                  {formData.description.length}/300
                </span>
              </div>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="뉴스레터에 대한 간단한 설명"
                disabled={isLoading || isFetching}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading || isFetching}>
                {isLoading ? "저장 중..." : "변경사항 저장"}
              </Button>
            </div>
          </form>
        </section>

        {/* Email Settings Section */}
        <section className="rounded-lg border border-border">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-medium">이메일 설정</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Sender Name */}
            <div className="grid gap-2">
              <Label htmlFor="senderName">발신자 이름</Label>
              <Input
                id="senderName"
                name="senderName"
                value={formData.senderName}
                onChange={handleChange}
                placeholder="발신자 이름"
                disabled={isLoading || isFetching}
              />
              <p className="text-xs text-muted-foreground">
                이메일 발신자로 표시되는 이름입니다.
              </p>
            </div>

            {/* Timezone */}
            <div className="grid gap-2">
              <Label htmlFor="timezone">시간대</Label>
              <Select
                value={formData.timezone}
                onValueChange={handleTimezoneChange}
                disabled={isLoading || isFetching}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="시간대를 선택하세요" />
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
                예약 발송 및 통계에 사용됩니다.
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={isLoading || isFetching}
              >
                {isLoading ? "저장 중..." : "변경사항 저장"}
              </Button>
            </div>
          </div>
        </section>

        {/* Subscribe Widget Section */}
        <section className="rounded-lg border border-border">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-medium">구독 위젯</h2>
            <p className="text-sm text-muted-foreground">
              블로그나 웹사이트 어디에서든 붙여넣을 수 있는 구독 폼입니다.
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">임베드 코드</p>
                <p className="text-xs text-muted-foreground">
                  iframe 코드를 복사해 붙여넣으세요.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyEmbed}>
                코드 복사
              </Button>
            </div>

            <Textarea
              value={embedCode}
              readOnly
              className="min-h-[160px] font-mono text-xs"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

