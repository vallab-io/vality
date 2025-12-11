"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common";
import { MenuIcon, CloseIcon } from "@/components/icons";
import { MARKETING_NAV_ITEMS } from "@/constants/navigation";

export function MarketingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-6 md:flex">
              {MARKETING_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Actions */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">시작하기</Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 md:hidden"
            onClick={toggleMenu}
            aria-label="메뉴 열기"
          >
            {isMenuOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
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
          {MARKETING_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="border-t border-border p-4 space-y-2">
          <Link href="/login" onClick={closeMenu}>
            <Button variant="outline" className="w-full">
              로그인
            </Button>
          </Link>
          <Link href="/signup" onClick={closeMenu}>
            <Button className="w-full">시작하기</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
