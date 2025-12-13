import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 날짜/시간 유틸리티는 별도 파일로 분리
// @see lib/utils/date.ts
export * from "./utils/date"
