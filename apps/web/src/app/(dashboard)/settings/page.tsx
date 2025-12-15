"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { PageHeader } from "@/components/common";
import { cn } from "@/lib/utils";
import { ProfileSettings } from "./_components/profile-settings";
import { NewsletterSettings } from "./_components/newsletter-settings";
import { AccountSettings } from "./_components/account-settings";
import { authLoadingAtom, userAtom } from "@/stores/auth.store";
import { getCurrentUser } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";

const TABS = [
  { id: "profile", label: "프로필" },
  { id: "newsletter", label: "뉴스레터" },
  { id: "account", label: "계정" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const router = useRouter();
  const authLoading = useAtomValue(authLoadingAtom);
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [isFetching, setIsFetching] = useState(false);

  // 인증/유저 정보 보장
  useEffect(() => {
    if (authLoading || isFetching) return;
    if (user) return;

    const fetchUser = async () => {
      setIsFetching(true);
      try {
        const me = await getCurrentUser();
        setUser(me);
      } catch (error) {
        const msg = getErrorMessage(error);
        console.error("Failed to load user", error);
        // 토큰이 만료된 경우 로그인으로 이동
        router.push("/login");
        if (msg) {
          // 알림 없이 이동
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchUser();
  }, [authLoading, isFetching, user, setUser, router]);

  // 로딩 상태 처리
  if (authLoading || isFetching || !user) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="설정" description="프로필과 뉴스레터 설정을 관리하세요." />
        <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          로딩 중...
        </div>
      </div>
    );
  }

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

