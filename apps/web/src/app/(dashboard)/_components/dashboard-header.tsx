"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo, UserAvatar } from "@/components/common";
import { MenuIcon, CloseIcon } from "@/components/icons";
import { DASHBOARD_NAV_ITEMS } from "@/constants/navigation";

export function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <Logo href="/dashboard" />

        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
          onClick={toggleMenu}
          aria-label="메뉴 열기"
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
          "fixed right-0 top-0 z-50 h-full w-64 transform bg-background shadow-lg transition-transform duration-200 ease-in-out md:hidden",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Menu Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <span className="font-semibold">메뉴</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={closeMenu}
            aria-label="메뉴 닫기"
          >
            <CloseIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1 p-4">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <Link
            href="/dashboard/settings"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <UserAvatar name="사용자" email="user@example.com" showInfo />
          </Link>
        </div>
      </div>
    </>
  );
}
