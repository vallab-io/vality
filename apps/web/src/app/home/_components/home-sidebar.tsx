"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/common";
import { HomeIcon, DashboardIcon, MenuIcon, CloseIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/use-translation";

export function HomeSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const isAuthenticated = !!user;
  const t = useT();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    closeMenu(); // 모바일 메뉴 닫기
    // 홈 페이지에 그대로 유지
    router.refresh();
  };

  const NavContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {/* Home */}
        <Link
          href="/home"
          onClick={onItemClick}
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
            onClick={onItemClick}
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

        {/* Profile - 항상 표시 (인증되지 않은 경우 로그인으로 이동) */}
        <Link
          href={isAuthenticated && user?.username ? `/@${user.username}` : "/login"}
          onClick={onItemClick}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isAuthenticated && user?.username && pathname === `/@${user.username}`
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          {isAuthenticated && user ? (
            user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.name || user.email || t("common.user")}
                className="h-5 w-5 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">
                {(user.name || user.email || "U")[0].toUpperCase()}
              </div>
            )
          ) : (
            <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
          {t("sidebar.profile")}
        </Link>
      </nav>

      {/* Footer - About & Sign Out */}
      <div className="border-t border-border px-3 py-4 space-y-2">
        <Link
          href="/about"
          onClick={onItemClick}
          className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("sidebar.about")}
        </Link>
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleLogout();
              onItemClick?.();
            }}
            className="w-full justify-start text-xs text-muted-foreground hover:text-foreground h-auto py-1.5 px-0"
          >
            {t("sidebar.logout")}
          </Button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <Logo href="/home" />
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <CloseIcon className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 transform flex-col bg-background shadow-lg transition-transform duration-200 ease-in-out md:hidden",
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Menu Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Logo href="/home" />
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <CloseIcon className="h-5 w-5" />
          </Button>
        </div>
        <NavContent onItemClick={closeMenu} />
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-background md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Logo href="/home" />
        </div>
        <NavContent />
      </aside>
    </>
  );
}

