import { cookies } from "next/headers";
import { Locale, defaultLocale } from "./locales/index";

const COOKIE_NAME = "vality-locale";

/**
 * Cookie에서 locale 읽기 (서버 사이드)
 */
export async function getLocaleFromCookieServer(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(COOKIE_NAME);
  
  if (localeCookie?.value && (localeCookie.value === "en" || localeCookie.value === "ko")) {
    return localeCookie.value as Locale;
  }
  
  return defaultLocale;
}

