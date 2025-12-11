"use client";

import { useState } from "react";
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

// 목업 데이터
const MOCK_USER = {
  username: "johndoe",
};

const MOCK_NEWSLETTER = {
  name: "John's Weekly",
  slug: "weekly",
  description:
    "매주 월요일, 디자인과 프로덕트에 대한 인사이트를 전달합니다.",
  senderName: "John Doe",
  timezone: "Asia/Seoul",
};

export default function NewsletterSettingsPage() {
  const params = useParams();
  const newsletterId = params.newsletterId as string;
  
  // newsletterId를 활용해 해당 뉴스레터 설정을 가져올 수 있음
  console.log("Newsletter ID:", newsletterId);
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: MOCK_NEWSLETTER.name,
    slug: MOCK_NEWSLETTER.slug,
    description: MOCK_NEWSLETTER.description,
    senderName: MOCK_NEWSLETTER.senderName,
    timezone: MOCK_NEWSLETTER.timezone,
  });

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
  src="https://vality.io/@${MOCK_USER.username}/${formData.slug}/subscribe-widget"
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
      console.log("Newsletter settings update:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("뉴스레터 설정이 저장되었습니다.");
    } catch (error) {
      console.error("Newsletter settings update error:", error);
      toast.error("설정 저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

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
                disabled={isLoading}
              />
            </div>

            {/* Slug */}
            <div className="grid gap-2">
              <Label htmlFor="slug">URL 슬러그</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                  /@{MOCK_USER.username}/
                </span>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="newsletter-slug"
                  disabled={isLoading}
                  className="rounded-l-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                vality.io/@{MOCK_USER.username}/{formData.slug || "slug"}
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
                disabled={isLoading}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading}>
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
                disabled={isLoading}
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
                disabled={isLoading}
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
              <Button type="button" disabled={isLoading}>
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

