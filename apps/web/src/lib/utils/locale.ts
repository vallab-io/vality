/**
 * Locale 유틸리티 함수
 * Locale 타입을 Intl API에서 사용하는 형식으로 변환
 */

import type { Locale } from "@/lib/i18n/locales/types";

/**
 * Locale을 Intl API 형식으로 변환
 * "ko" -> "ko-KR", "en" -> "en-US"
 */
export function getIntlLocale(locale: Locale): string {
  const localeMap: Record<Locale, string> = {
    ko: "ko-KR", en: "en-US",
  };
  return localeMap[locale] || "en-US";
}
