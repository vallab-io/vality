"use client";

import { useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { localeAtom, setLocaleAtom } from "@/stores/locale.store";
import { getLocaleFromCookie } from "@/lib/i18n/utils";

interface LocaleProviderProps {
  children: React.ReactNode;
}

/**
 * Locale 초기화 Provider
 * Cookie에서 locale을 읽어서 atom에 설정
 */
export function LocaleProvider({ children }: LocaleProviderProps) {
  const locale = useAtomValue(localeAtom);
  const setLocale = useSetAtom(setLocaleAtom);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 초기 마운트 시 Cookie에서 locale 읽기
    const cookieLocale = getLocaleFromCookie();
    setLocale(cookieLocale);
    setIsInitialized(true);
  }, [setLocale]);

  useEffect(() => {
    // HTML lang 속성 설정
    if (typeof document !== "undefined" && isInitialized) {
      document.documentElement.lang = locale;
    }
  }, [locale, isInitialized]);

  return <>{children}</>;
}

