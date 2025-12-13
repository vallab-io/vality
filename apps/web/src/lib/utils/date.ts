/**
 * 날짜/시간 유틸리티 함수
 * API에서 받은 UTC 시간을 클라이언트 타임존에 맞게 변환
 */

/**
 * UTC ISO 8601 문자열을 Date 객체로 변환
 * @param dateString - ISO 8601 형식의 UTC 시간 문자열 (예: "2024-12-13T08:30:00Z")
 * @returns Date 객체
 */
export function parseUTCDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * UTC 시간을 한국 시간으로 포맷팅
 * @param dateString - ISO 8601 형식의 UTC 시간 문자열
 * @param options - Intl.DateTimeFormatOptions
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const date = parseUTCDate(dateString);
  return new Intl.DateTimeFormat("ko-KR", options).format(date);
}

/**
 * UTC 시간을 상대 시간으로 표시 (예: "2시간 전", "3일 전")
 * @param dateString - ISO 8601 형식의 UTC 시간 문자열
 * @returns 상대 시간 문자열
 */
export function formatRelativeTime(dateString: string): string {
  const date = parseUTCDate(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "방금 전";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}일 전`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}개월 전`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}년 전`;
}

/**
 * UTC 시간을 특정 타임존으로 변환하여 포맷팅
 * @param dateString - ISO 8601 형식의 UTC 시간 문자열
 * @param timezone - IANA 타임존 (예: "Asia/Seoul", "America/New_York")
 * @param options - Intl.DateTimeFormatOptions
 * @returns 포맷된 날짜 문자열
 */
export function formatDateInTimezone(
  dateString: string,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }
): string {
  const date = parseUTCDate(dateString);
  return new Intl.DateTimeFormat("ko-KR", {
    ...options,
    timeZone: timezone,
  }).format(date);
}

/**
 * UTC 시간을 날짜와 시간으로 포맷팅
 * @param dateString - ISO 8601 형식의 UTC 시간 문자열
 * @returns 포맷된 날짜/시간 문자열
 */
export function formatDateTime(dateString: string): string {
  return formatDate(dateString, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * UTC 시간을 짧은 형식으로 포맷팅 (예: "2024.12.13")
 * @param dateString - ISO 8601 형식의 UTC 시간 문자열
 * @returns 포맷된 날짜 문자열
 */
export function formatShortDate(dateString: string): string {
  return formatDate(dateString, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

