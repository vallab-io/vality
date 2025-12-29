export { type Locale, type Translations, defaultLocale, locales } from "./types";
export { en } from "./en";
export { ko } from "./ko";

import { en } from "./en";
import { ko } from "./ko";
import { Locale, Translations } from "./types";

export const translations: Record<Locale, Translations> = {
  en,
  ko,
};

