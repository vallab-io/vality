"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo, UserAvatar } from "@/components/common";
import { CheckIcon, PlusIcon, HomeIcon, SettingsIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom } from "@/stores/auth.store";
import { getMyNewsletters, type Newsletter } from "@/lib/api/newsletter";

// 플랜 기본값 (향후 API 연동 시 교체)
const DEFAULT_PLAN: "free" | "pro" = "free";

const MAX_FREE_NEWSLETTERS = 1;

// 뉴스레터 아이콘
function NewsletterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
      />
    </svg>
  );
}

// 화살표 아이콘
function ChevronIcon({ className, isOpen }: { className?: string; isOpen: boolean }) {
  return (
    <svg
      className={cn(className, "transition-transform", isOpen && "rotate-180")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const setUser = useSetAtom(userAtom);
  const user = useAtomValue(userAtom);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(true);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // 뉴스레터 목록 가져오기
  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        setIsLoading(true);
        const data = await getMyNewsletters();
        // createdAt 기준으로 정렬 (첫 번째가 가장 오래된 것 = default)
        const sortedData = [...data].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setNewsletters(sortedData);
        // 첫 번째 뉴스레터를 기본값으로 설정
        if (sortedData.length > 0) {
          setSelectedNewsletter(sortedData[0]);
        }
      } catch (error) {
        console.error("Failed to fetch newsletters:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewsletters();
  }, []);

  // selectedNewsletter가 null이거나 목록에 없으면 첫 번째로 재설정
  useEffect(() => {
    if (newsletters.length > 0 && !selectedNewsletter) {
      setSelectedNewsletter(newsletters[0]);
    }
  }, [newsletters]);

  const canCreateNewsletter =
    DEFAULT_PLAN === "pro" || newsletters.length < MAX_FREE_NEWSLETTERS;

  const handleCreateNewsletter = () => {
    if (!canCreateNewsletter) {
      setShowUpgradeDialog(true);
    } else {
      // TODO: 새 뉴스레터 생성 페이지/모달로 이동
      console.log("Create new newsletter");
    }
  };

  // 선택된 뉴스레터 기반으로 하위 메뉴 생성
  const getNewsletterSubItems = (newsletterId: string) => [
    { label: "이슈", href: `/dashboard/newsletters/${newsletterId}/issues` },
    { label: "구독자", href: `/dashboard/newsletters/${newsletterId}/subscribers` },
    { label: "통계", href: `/dashboard/newsletters/${newsletterId}/analytics` },
    { label: "설정", href: `/dashboard/newsletters/${newsletterId}/settings` },
  ];

  const newsletterSubItems = selectedNewsletter
    ? getNewsletterSubItems(selectedNewsletter.id)
    : [];

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-background md:flex md:flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-border px-6">
          <Logo href="/dashboard" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {/* 홈/대시보드 */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/dashboard"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <HomeIcon className="h-5 w-5" />
            홈
          </Link>

          {/* 뉴스레터 섹션 (아코디언) */}
          <div className="pt-2">
            {/* 뉴스레터 헤더 - 드롭다운으로 전환 */}
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    disabled={isLoading || newsletters.length === 0}
                  >
                    <NewsletterIcon className="h-5 w-5" />
                    <span className="truncate">
                      {isLoading
                        ? "로딩 중..."
                        : selectedNewsletter
                        ? selectedNewsletter.name
                        : "뉴스레터 없음"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {newsletters.map((newsletter) => (
                    <DropdownMenuItem
                      key={newsletter.id}
                      onClick={() => setSelectedNewsletter(newsletter)}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate">{newsletter.name}</span>
                      {selectedNewsletter?.id === newsletter.id && (
                        <CheckIcon className="h-4 w-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  {newsletters.length > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={handleCreateNewsletter}
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>새 뉴스레터 만들기</span>
                    {!canCreateNewsletter && (
                      <span className="ml-auto rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                        Pro
                      </span>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* 접기/펼치기 버튼 */}
              <button
                onClick={() => setIsNewsletterOpen(!isNewsletterOpen)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <ChevronIcon className="h-4 w-4" isOpen={isNewsletterOpen} />
              </button>
            </div>

            {/* 뉴스레터 하위 메뉴 */}
            {isNewsletterOpen && selectedNewsletter && (
              <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
                {newsletterSubItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* 계정 설정 */}
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/dashboard/settings"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <SettingsIcon className="h-5 w-5" />
            계정 설정
          </Link>
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
            <UserAvatar
              name={user?.name || user?.email || "사용자"}
              email={user?.email || undefined}
              imageUrl={user?.imageUrl || undefined}
              showInfo
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              setUser(null);
              router.push("/");
            }}
          >
            로그아웃
          </Button>
        </div>
      </aside>

      {/* Pro Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pro로 업그레이드</DialogTitle>
            <DialogDescription>
              Free 플랜에서는 1개의 뉴스레터만 운영할 수 있습니다.
              Pro로 업그레이드하여 무제한 뉴스레터를 만들어보세요.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold">Pro</h3>
                <div className="text-right">
                  <span className="text-2xl font-bold">₩9,900</span>
                  <span className="text-sm text-muted-foreground">/월</span>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-primary" />
                  무제한 뉴스레터
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-primary" />
                  무제한 구독자
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-primary" />
                  고급 분석
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-primary" />
                  커스텀 도메인
                </li>
              </ul>
            </div>
            <Button className="w-full" onClick={() => setShowUpgradeDialog(false)}>
              Pro 시작하기
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              언제든지 취소할 수 있습니다
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
