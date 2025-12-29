import { Locale, defaultLocale, translations } from "./locales/index";

const COOKIE_NAME = "vality-locale";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1년

/**
 * Cookie에서 locale 읽기 (클라이언트 사이드)
 */
export function getLocaleFromCookie(): Locale {
  if (typeof document === "undefined") {
    return defaultLocale;
  }

  const cookies = document.cookie.split(";");
  const localeCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${COOKIE_NAME}=`)
  );

  if (localeCookie) {
    const locale = localeCookie.split("=")[1]?.trim() as Locale;
    if (locale && (locale === "en" || locale === "ko")) {
      return locale;
    }
  }

  return defaultLocale;
}

/**
 * Cookie에 locale 저장 (클라이언트 사이드)
 */
export function setLocaleToCookie(locale: Locale): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * 번역 텍스트 가져오기
 */
export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split(".");
  let value: any = translations[locale];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      value = translations[defaultLocale];
      for (const fallbackKey of keys) {
        if (value && typeof value === "object" && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if translation not found
        }
      }
      break;
    }
  }

  return typeof value === "string" ? value : key;
}

