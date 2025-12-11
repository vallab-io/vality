"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common";
import { cn } from "@/lib/utils";
import { ProfileSettings } from "./_components/profile-settings";
import { NewsletterSettings } from "./_components/newsletter-settings";
import { AccountSettings } from "./_components/account-settings";

const TABS = [
  { id: "profile", label: "프로필" },
  { id: "newsletter", label: "뉴스레터" },
  { id: "account", label: "계정" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="설정"
        description="프로필과 뉴스레터 설정을 관리하세요."
      />

      {/* Tabs */}
      <div className="mt-8 border-b border-border">
        <nav className="-mb-px flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "newsletter" && <NewsletterSettings />}
        {activeTab === "account" && <AccountSettings />}
      </div>
    </div>
  );
}

