"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// 목업 뉴스레터 데이터
const MOCK_NEWSLETTER = {
  name: "John's Weekly",
  description:
    "매주 월요일, 디자인과 프로덕트에 대한 인사이트를 전달합니다.",
  senderName: "John Doe",
  replyTo: "john@example.com",
};

export function NewsletterSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: MOCK_NEWSLETTER.name,
    description: MOCK_NEWSLETTER.description,
    senderName: MOCK_NEWSLETTER.senderName,
    replyTo: MOCK_NEWSLETTER.replyTo,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: API 연동
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Newsletter Name */}
      <div className="space-y-2">
        <Label htmlFor="name">뉴스레터 이름</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="뉴스레터 이름"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          구독자에게 보여지는 뉴스레터 이름입니다.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="뉴스레터에 대한 간단한 설명"
          disabled={isLoading}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {formData.description.length}/300자
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-medium">이메일 설정</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          뉴스레터 발송 시 사용되는 설정입니다.
        </p>
      </div>

      {/* Sender Name */}
      <div className="space-y-2">
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

      {/* Reply To */}
      <div className="space-y-2">
        <Label htmlFor="replyTo">회신 이메일</Label>
        <Input
          id="replyTo"
          name="replyTo"
          type="email"
          value={formData.replyTo}
          onChange={handleChange}
          placeholder="reply@example.com"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          구독자가 회신할 때 사용할 이메일 주소입니다.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "저장 중..." : "저장하기"}
        </Button>
      </div>
    </form>
  );
}

