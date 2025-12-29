import { atom } from "jotai";
import { Locale, defaultLocale } from "@/lib/i18n/locales/index";
import { getLocaleFromCookie, setLocaleToCookie } from "@/lib/i18n/utils";

// Locale atom (기본값은 defaultLocale, 초기화는 LocaleProvider에서)
export const localeAtom = atom<Locale>(defaultLocale);

// Locale 변경 함수
export const setLocaleAtom = atom(
  null,
  (get, set, newLocale: Locale) => {
    set(localeAtom, newLocale);
    setLocaleToCookie(newLocale);
    // HTML lang 속성 업데이트
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale;
    }
  }
);

