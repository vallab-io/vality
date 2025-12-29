"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common";
import { MenuIcon, CloseIcon } from "@/components/icons";
import { MARKETING_NAV_ITEMS } from "@/constants/navigation";
import { useAtomValue } from "jotai";
import { userAtom, authLoadingAtom } from "@/stores/auth.store";
import { getMyNewsletters } from "@/lib/api/newsletter";

export function MarketingHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAtomValue(userAtom);
  const authLoading = useAtomValue(authLoadingAtom);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // /about, /pricing, /price, /terms, /privacy 페이지에서 Logo 클릭 시 /about으로 이동
  const logoHref = ["/about", "/pricing", "/price", "/terms", "/privacy"].includes(pathname) ? "/about" : "/";

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLoginClick = async () => {
    if (authLoading) return;
    
    if (user) {
      // 인증된 사용자인 경우 뉴스레터 확인
      try {
        const newsletters = await getMyNewsletters();
        if (newsletters.length === 0) {
          // 뉴스레터가 없으면 onboarding으로 이동
          router.push("/onboarding");
        } else {
          // 뉴스레터가 있으면 대시보드로 이동
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Failed to check newsletters:", error);
        // 에러 발생 시 onboarding으로 이동 (안전하게)
        router.push("/onboarding");
      }
    } else {
      // 인증되지 않은 사용자는 로그인 페이지로
      router.push("/login");
    }
    closeMenu();
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Logo href={logoHref} />
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/home"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-[#2563EB] dark:hover:text-[#38BDF8] relative group"
              >
                홈
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2563EB] dark:bg-[#38BDF8] group-hover:w-full transition-all duration-200" />
              </Link>
              {MARKETING_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground transition-all duration-200 hover:text-[#2563EB] dark:hover:text-[#38BDF8] relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2563EB] dark:bg-[#38BDF8] group-hover:w-full transition-all duration-200" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Actions */}
          <nav className="hidden items-center gap-2 md:flex">
            {user ? (
              <Button size="sm" onClick={handleLoginClick} disabled={authLoading} className="bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200">
                대시보드
              </Button>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={handleLoginClick} disabled={authLoading} className="hover:bg-muted/50">
                  로그인
                </Button>
                <Link href="/signup">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200">
                    시작하기
                  </Button>
                </Link>
              </>
            )}
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
          <Link
            href="/home"
            onClick={closeMenu}
            className="block rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            홈
          </Link>
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
          {user ? (
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleLoginClick} disabled={authLoading}>
              대시보드
            </Button>
          ) : (
            <>
              <Button className="w-full" onClick={handleLoginClick} disabled={authLoading}>
                로그인
              </Button>
              <Link href="/signup" onClick={closeMenu}>
                <Button className="w-full bg-primary hover:bg-primary/90">시작하기</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
