/**
 * 날짜/시간 유틸리티 함수
 *
 * API에서 받은 UTC 시간을 클라이언트의 브라우저 타임존에 맞게 자동 변환합니다.
 * 모든 함수는 i18n locale을 따라가며, 브라우저의 timezone을 자동으로 사용합니다.
 */

import type { Locale } from "@/lib/i18n/locales/types";
import { getIntlLocale } from "./locale";

/**
 * UTC ISO 8601 문자열을 Date 객체로 변환
 *
 * @param dateString - ISO 8601 형식의 UTC 시간 문자열 (예: "2024-12-13T08:30:00Z")
 * @returns Date 객체
 * @internal - 내부적으로만 사용되며, 외부에서 직접 호출하지 않습니다.
 */
function parseUTCDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * UTC 시간을 locale에 맞게 포맷팅 (브라우저 timezone 자동 사용)
 *
 * 서버에서 받은 UTC 시간을 사용자의 브라우저 timezone으로 자동 변환하여 표시합니다.
 * i18n locale에 따라 날짜 형식이 자동으로 변경됩니다.
 *
 * @param dateString - ISO 8601 형식의 UTC 시간 문자열 (예: "2024-12-13T08:30:00Z")
 * @param locale - Locale ("ko" | "en") - i18n locale을 따라감
 * @param options - Intl.DateTimeFormatOptions (기본값: 년/월/일)
 * @returns 포맷된 날짜 문자열 (브라우저 timezone으로 변환됨)
 *
 * @example
 * ```typescript
 * formatDate("2024-12-13T08:30:00Z", "ko");
 * // 한국에서 접속: "2024년 12월 13일" (KST로 변환)
 *
 * formatDate("2024-12-13T08:30:00Z", "en");
 * // 미국에서 접속: "December 13, 2024" (EST/PST 등으로 변환)
 * ```
 */
export function formatDate(
  dateString: string,
  locale: Locale = "en",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const date = parseUTCDate(dateString);

  // 브라우저의 timezone을 자동으로 감지하여 사용
  // 서버 사이드에서는 UTC 사용
  const browserTimezone = typeof window !== "undefined"
    ? Intl.DateTimeFormat()
      .resolvedOptions().timeZone
    : "UTC";

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    ...options,
    timeZone: browserTimezone,
  }).format(date);
}

/**
 * UTC 시간을 상대 시간으로 표시 (예: "방금 전", "2시간 전", "3일 전")
 *
 * 현재 시간과의 차이를 계산하여 상대적인 시간 표현을 반환합니다.
 * 1주일(7일) 이상 지난 경우에는 formatDate를 사용하여 날짜를 표시합니다.
 * 브라우저 timezone을 자동으로 고려하여 계산합니다.
 *
 * @param dateString - ISO 8601 형식의 UTC 시간 문자열 (예: "2024-12-13T08:30:00Z")
 * @param locale - Locale ("ko" | "en") - i18n locale을 따라감
 * @returns 상대 시간 문자열 또는 포맷된 날짜 문자열
 *
 * @example
 * ```typescript
 * formatRelativeTime("2024-12-13T08:30:00Z", "ko");
 * // "방금 전", "5분 전", "2시간 전", "3일 전" (7일 미만)
 * // "2024년 12월 13일" (7일 이상)
 *
 * formatRelativeTime("2024-12-13T08:30:00Z", "en");
 * // "just now", "5 minutes ago", "2 hours ago", "3 days ago" (7일 미만)
 * // "December 13, 2024" (7일 이상)
 * ```
 */
export function formatRelativeTime(dateString: string, locale: Locale = "en"): string {
  const date = parseUTCDate(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // 미래 시간인 경우
  if (diffInSeconds < 0) {
    return locale === "ko" ? "방금 전" : "just now";
  }

  // 1주일(7일) 이상 지난 경우 formatDate 사용
  const diffInDays = Math.floor(diffInSeconds / (60 * 60 * 24));
  if (diffInDays >= 7) {
    return formatDate(dateString, locale);
  }

  if (locale === "ko") {
    // 1분 미만
    if (diffInSeconds < 60) {
      return "방금 전";
    }

    // 1시간 미만
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    }

    // 24시간 미만
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    }

    // 7일 미만
    return `${diffInDays}일 전`;
  } else {
    // English
    // Less than 1 minute
    if (diffInSeconds < 60) {
      return "just now";
    }

    // Less than 1 hour
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }

    // Less than 24 hours
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }

    // Less than 7 days
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }
}

/**
 * UTC 시간을 짧은 형식으로 포맷팅 (브라우저 timezone 자동 사용)
 *
 * formatDate의 간편 버전으로, 짧은 월 이름을 사용합니다 (예: "Dec 13, 2024").
 *
 * @param dateString - ISO 8601 형식의 UTC 시간 문자열 (예: "2024-12-13T08:30:00Z")
 * @param locale - Locale ("ko" | "en") - i18n locale을 따라감
 * @returns 포맷된 날짜 문자열 (브라우저 timezone으로 변환됨)
 *
 * @example
 * ```typescript
 * formatShortDate("2024-12-13T08:30:00Z", "ko");
 * // "2024년 12월 13일"
 *
 * formatShortDate("2024-12-13T08:30:00Z", "en");
 * // "Dec 13, 2024"
 * ```
 */
export function formatShortDate(dateString: string, locale: Locale = "en"): string {
  return formatDate(dateString, locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

