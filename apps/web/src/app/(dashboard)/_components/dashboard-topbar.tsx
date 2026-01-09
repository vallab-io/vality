"use client";

import { usePathname } from "next/navigation";
import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { useT } from "@/hooks/use-translation";
import { useTopbarAction } from "./topbar-action-context";

export function DashboardTopbar() {
  const pathname = usePathname();
  const t = useT();
  const { action } = useTopbarAction();

  // pathname에 따른 페이지 제목 결정
  const getPageTitle = () => {
    if (pathname === "/dashboard") {
      return t("dashboard.title");
    }
    if (pathname === "/dashboard/settings") {
      return t("sidebar.accountSettings");
    }
    if (pathname === "/dashboard/subscription") {
      return t("sidebar.subscription");
    }
    if (pathname?.includes("/issues/") && !pathname?.endsWith("/issues")) {
      return "";
    }
    if (pathname?.includes("/issues")) {
      return t("issues.title");
    }
    if (pathname?.includes("/subscribers")) {
      return t("subscribers.title");
    }
    if (pathname?.includes("/analytics")) {
      return t("analytics.title");
    }
    if (pathname?.includes("/settings")) {
      return t("settings.newsletterSettings");
    }
    return t("dashboard.title");
  };

  return (
    <header className="sticky top-0 z-30 hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block">
      <div className="mx-auto max-w-4xl">
        <div className="flex h-14 items-center justify-between">
          <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            {action}
          </div>
        </div>
      </div>
    </header>
  );
}
