/**
 * SEO 관련 유틸리티 함수
 */

const SITE_URL = "https://vality.io";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.svg`;

/**
 * HTML 태그를 제거하고 텍스트만 추출
 * @param html HTML 문자열
 * @returns HTML 태그가 제거된 순수 텍스트
 */
export function stripHtmlTags(html: string): string {
  if (!html) return "";

  // HTML 태그 제거
  let text = html.replace(/<[^>]*>/g, " ");

  // HTML 엔티티 디코딩
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  // 연속된 공백을 하나로 변경
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * HTML에서 description 생성 (첫 N자)
 * @param html HTML 문자열
 * @param maxLength 최대 길이 (기본값: 160)
 * @returns description 문자열
 */
export function generateExcerpt(html: string, maxLength: number = 160): string {
  const text = stripHtmlTags(html);

  if (text.length <= maxLength) {
    return text;
  }

  // 단어 경계에서 자르기
  const truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  if (lastSpaceIndex > maxLength * 0.8) {
    // 마지막 공백이 80% 이후에 있으면 그곳에서 자르기
    return truncated.slice(0, lastSpaceIndex) + "...";
  }

  return truncated + "...";
}

/**
 * 페이지의 절대 URL 생성
 * @param path 경로 (예: /@username/newsletterSlug/issueSlug)
 * @returns 절대 URL
 */
export function getAbsoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/**
 * HTML content에서 이미지 URL 추출
 * @param html HTML 문자열
 * @returns 이미지 URL 배열
 */
export function extractImageUrls(html: string): string[] {
  if (!html) return [];
  
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const urls: string[] = [];
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    if (url && !urls.includes(url)) {
      urls.push(url);
    }
  }
  
  return urls;
}
