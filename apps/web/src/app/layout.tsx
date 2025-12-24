import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Vality",
    template: "%s | Vality",
  },
  description:
    "뉴스레터를 발행하면 곧바로 웹에 기록되고, 검색 엔진에도 노출되는 개인 브랜딩 플랫폼",
  keywords: ["뉴스레터", "블로그", "개인 브랜딩", "SEO", "이메일 마케팅"],
  authors: [{ name: "Vality" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://vality.io",
    siteName: "Vality",
    title: "Vality - 뉴스레터 & 웹 아카이빙 플랫폼",
    description:
      "한 번 발행으로 이메일 · 블로그 · 프로필 콘텐츠가 동시에 완성되는 구조",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vality - 뉴스레터 & 웹 아카이빙 플랫폼",
    description:
      "한 번 발행으로 이메일 · 블로그 · 프로필 콘텐츠가 동시에 완성되는 구조",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
