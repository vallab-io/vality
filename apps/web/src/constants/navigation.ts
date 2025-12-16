import {
  HomeIcon,
  NewsletterIcon,
  SettingsIcon,
} from "@/components/icons";

/**
 * 대시보드 네비게이션 아이템
 */
export const DASHBOARD_NAV_ITEMS = [
  {
    label: "대시보드",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    label: "뉴스레터",
    href: "/dashboard/newsletters",
    icon: NewsletterIcon,
  },
  {
    label: "설정",
    href: "/dashboard/settings",
    icon: SettingsIcon,
  },
] as const;

/**
 * 마케팅 네비게이션 아이템
 */
export const MARKETING_NAV_ITEMS = [
  {
    label: "가격안내",
    href: "/pricing",
  },
  {
    label: "블로그",
    href: "/blog",
  },
] as const;

/**
 * 푸터 링크
 */
export const FOOTER_LINKS = [
  {
    label: "이용약관",
    href: "/terms",
  },
  {
    label: "개인정보처리방침",
    href: "/privacy",
  },
] as const;

