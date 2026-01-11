/**
 * Slug 생성 관련 유틸리티 함수
 */

/**
 * 한글을 로마자로 변환
 * 한글 음절을 초성, 중성, 종성으로 분해하여 로마자로 변환
 * ㅇ 초성은 받침이 없으면 생략, 받침이 있으면 적절히 처리
 * @param text 변환할 한글 텍스트
 * @returns 로마자로 변환된 텍스트
 */
export function koreanToRoman(text: string): string {
  // 초성 19개: ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ
  const initialChars = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
  // 중성 21개: ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ
  const medialChars = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
  // 종성 28개 (받침): 없음ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ
  const finalChars = ['', 'g', 'kk', 'gs', 'n', 'nj', 'nh', 'd', 'l', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh', 'm', 'b', 'bs', 's', 'ss', 'ng', 'j', 'ch', 'k', 't', 'p', 'h'];

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    
    // 한글 완성형 유니코드 범위 (AC00-D7AF)
    if (code >= 0xAC00 && code <= 0xD7AF) {
      // 한글 음절을 초성, 중성, 종성으로 분해
      const base = code - 0xAC00;
      const initial = Math.floor(base / (21 * 28)); // 0 ~ 18 (초성 19개)
      const medial = Math.floor((base % (21 * 28)) / 28); // 0 ~ 20 (중성 21개)
      const final = base % 28; // 0 ~ 27 (종성 28개, 0은 받침 없음)
      
      if (medial >= 0 && medial < medialChars.length) {
        const medialChar = medialChars[medial];
        
        // 초성이 ㅇ(11번)인 경우: 초성 생략하고 중성만 사용
        if (initial === 11) {
          // ㅇ 초성: 초성 생략, 중성 + 받침만
          result += medialChar;
          // 받침이 있으면 추가
          if (final > 0 && final < finalChars.length && finalChars[final]) {
            result += finalChars[final];
          }
        } else {
          // 일반 초성: 초성 + 중성 + 받침
          const initialChar = initialChars[initial];
          if (initialChar) {
            result += initialChar + medialChar;
            // 받침이 있으면 추가
            if (final > 0 && final < finalChars.length && finalChars[final]) {
              result += finalChars[final];
            }
          }
        }
      }
      // 변환 실패 시 해당 문자는 건너뜀 (나중에 제거됨)
    } else {
      // 한글이 아닌 문자는 그대로 유지
      result += char;
    }
  }
  return result;
}

/**
 * 제목을 기반으로 slug 생성
 * - 한글, 영어, 다른 언어를 모두 처리
 * - 한글은 로마자로 변환
 * - 최종적으로 영문 소문자, 숫자, 하이픈만 남김
 * - 제목이 없거나 결과가 비어있으면 빈값 반환
 * @param title 제목 문자열
 * @returns 생성된 slug 문자열
 */
export function generateSlug(title: string): string {
  let slug = title.trim();
  
  // 1. 한글을 로마자로 변환
  slug = koreanToRoman(slug);

  // 2. 유니코드 정규화 (악센트 제거 등)
  slug = slug
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // 3. 소문자로 변환
  slug = slug.toLowerCase();

  // 4. 영문, 숫자, 공백, 하이픈만 남기고 나머지 제거 (한글이 로마자로 변환된 후에도 유지)
  slug = slug.replace(/[^a-z0-9\s-]/g, "");

  // 5. 연속된 공백을 하이픈으로 변환
  slug = slug.replace(/\s+/g, "-");

  // 6. 연속된 하이픈을 하나로 변환
  slug = slug.replace(/-+/g, "-");

  // 7. 앞뒤 하이픈 제거
  slug = slug.replace(/^-+|-+$/g, "");

  // 8. 결과가 비어있거나 너무 짧으면 빈값 사용
  if (!slug || slug.length < 1) {
    return ``;
  }

  return slug;
}

