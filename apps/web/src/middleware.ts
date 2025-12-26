import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 시스템 경로 (리다이렉트하면 안 되는 경로들)
const SYSTEM_PATHS = [
  "/api",
  "/login",
  "/signup",
  "/onboarding",
  "/dashboard",
  "/pricing",
  "/blog",
  "/newsletter", // 구독 확인 등 시스템 경로
  "/auth",
  "/home",
  "/about",
  "/privacy",
  "/terms",
  "/_next",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // @ 로 시작하는 경로는 그대로 통과 (정상적인 프로필 URL)
  if (pathname.startsWith("/@")) {
    return NextResponse.next();
  }

  // 시스템 경로는 그대로 통과
  if (
    pathname === "/" ||
    SYSTEM_PATHS.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  // /username 형태의 경로를 /@username으로 리다이렉트
  // 단, /username/slug 형태도 /@username/slug로 리다이렉트
  const segments = pathname.split("/").filter(Boolean);
  
  if (segments.length >= 1) {
    const username = segments[0];
    
    // 유효한 username 패턴인지 체크 (영문, 숫자, 언더스코어만)
    if (/^[a-zA-Z0-9_]+$/.test(username)) {
      const newPath = `/@${segments.join("/")}`;
      const url = request.nextUrl.clone();
      url.pathname = newPath;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

