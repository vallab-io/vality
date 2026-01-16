"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useT } from "@/hooks/use-translation";
import { createContact } from "@/lib/api/contact";

export function ContactForm() {
  const t = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t("contact.nameRequired"));
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error(t("contact.emailRequired"));
      return;
    }

    if (!message.trim()) {
      toast.error(t("contact.messageRequired"));
      return;
    }

    if (!privacyAgreed) {
      toast.error(t("contact.privacyAgreedRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      await createContact({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        privacyAgreed: true,
      });

      toast.success(t("contact.submitSuccess"));
      
      // 폼 초기화
      setName("");
      setEmail("");
      setMessage("");
      setPrivacyAgreed(false);
    } catch (error: any) {
      console.error("Contact submission error:", error);
      const errorMessage = error?.response?.data?.message || error.message || t("contact.submitFailed");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="contact-name">{t("contact.name")}</Label>
        <Input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("contact.namePlaceholder")}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">{t("contact.email")}</Label>
        <Input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("contact.emailPlaceholder")}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">{t("contact.message")}</Label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("contact.messagePlaceholder")}
          rows={6}
          disabled={isSubmitting}
          required
          className="resize-none"
        />
      </div>

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="contact-privacy"
          checked={privacyAgreed}
          onChange={(e) => setPrivacyAgreed(e.target.checked)}
          disabled={isSubmitting}
          required
          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="contact-privacy" className="text-sm leading-relaxed cursor-pointer">
          {t("contact.privacyAgreed")}
        </Label>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !privacyAgreed}
        size="lg"
        className="w-full h-12 text-base font-semibold"
      >
        {isSubmitting ? t("contact.submitting") : t("contact.submit")}
      </Button>
    </form>
  );
}
