"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common";
import { HomeIcon, DashboardIcon } from "@/components/icons";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/use-translation";

export function HomeSidebar() {
  const pathname = usePathname();
  const user = useAtomValue(userAtom);
  const isAuthenticated = !!user;
  const t = useT();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Logo href="/home" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {/* Home */}
        <Link
          href="/home"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/home"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <HomeIcon className="h-5 w-5" />
          {t("sidebar.home")}
        </Link>

        {/* Dashboard - 인증된 경우만 표시 */}
        {isAuthenticated && (
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname?.startsWith("/dashboard")
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <DashboardIcon className="h-5 w-5" />
            {t("sidebar.dashboard")}
          </Link>
        )}

        {/* Profile - 인증된 경우만 표시 */}
        {isAuthenticated && user?.username && (
          <Link
            href={`/@${user.username}`}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === `/@${user.username}`
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.name || user.email || t("common.user")}
                className="h-5 w-5 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">
                {(user.name || user.email || "U")[0].toUpperCase()}
              </div>
            )}
            {t("sidebar.profile")}
          </Link>
        )}
      </nav>

      {/* Footer - About */}
      <div className="border-t border-border px-3 py-4">
        <Link
          href="/about"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("sidebar.about")}
        </Link>
      </div>
    </aside>
  );
}

