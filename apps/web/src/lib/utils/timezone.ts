/**
 * Timezone 유틸리티 함수
 * 
 * - TIMEZONES: 뉴스레터 설정에서 사용하는 주요 timezone 목록
 */

/**
 * Timezone 정보 인터페이스
 */
export interface Timezone {
  /** IANA timezone (예: "Asia/Seoul") */
  value: string;
  /** 표시 이름 (예: "Asia/Seoul") */
  label: string;
  /** GMT 오프셋 (예: "GMT+09:00") */
  offset: string;
}

/**
 * 주요 Timezone 목록 (IANA timezone format)
 * 
 * 뉴스레터 설정 페이지에서 사용하는 timezone 목록입니다.
 * 이 목록을 기준으로 COUNTRIES가 자동 생성됩니다.
 */
export const TIMEZONES: Timezone[] = [
  { value: "Asia/Seoul", label: "Asia/Seoul", offset: "GMT+09:00" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo", offset: "GMT+09:00" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai", offset: "GMT+08:00" },
  { value: "Asia/Singapore", label: "Asia/Singapore", offset: "GMT+08:00" },
  { value: "Asia/Hong_Kong", label: "Asia/Hong_Kong", offset: "GMT+08:00" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok", offset: "GMT+07:00" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata", offset: "GMT+05:30" },
  { value: "Asia/Dubai", label: "Asia/Dubai", offset: "GMT+04:00" },
  { value: "Europe/London", label: "Europe/London", offset: "GMT+00:00" },
  { value: "Europe/Paris", label: "Europe/Paris", offset: "GMT+01:00" },
  { value: "Europe/Berlin", label: "Europe/Berlin", offset: "GMT+01:00" },
  { value: "America/New_York", label: "America/New_York", offset: "GMT-05:00" },
  { value: "America/Chicago", label: "America/Chicago", offset: "GMT-06:00" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles", offset: "GMT-08:00" },
  { value: "Pacific/Honolulu", label: "Pacific/Honolulu", offset: "GMT-10:00" },
  { value: "Australia/Sydney", label: "Australia/Sydney", offset: "GMT+11:00" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland", offset: "GMT+13:00" },
];

/**
 * 브라우저의 timezone 가져오기
 * 
 * 사용자가 접속한 지역의 timezone을 자동으로 감지합니다.
 * 
 * @returns IANA timezone (예: "Asia/Seoul", "America/New_York")
 *          서버 사이드에서는 "UTC" 반환
 * 
 * @example
 * ```typescript
 * const timezone = getBrowserTimezone(); // "Asia/Seoul" (한국에서 접속한 경우)
 * ```
 */
export function getBrowserTimezone(): string {
  if (typeof window === "undefined") {
    return "UTC";
  }

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}
