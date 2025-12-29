"use client";

import { useAtomValue } from "jotai";
import { localeAtom } from "@/stores/locale.store";
import { getTranslation } from "@/lib/i18n/utils";

/**
 * 번역 훅
 * @param key - 번역 키 (예: "common.home", "pricing.title")
 * @returns 번역된 텍스트
 */
export function useTranslation(key: string): string {
  const locale = useAtomValue(localeAtom);
  return getTranslation(locale, key);
}

/**
 * 번역 함수 반환 훅
 * @returns t 함수
 */
export function useT() {
  const locale = useAtomValue(localeAtom);
  return (key: string) => getTranslation(locale, key);
}

