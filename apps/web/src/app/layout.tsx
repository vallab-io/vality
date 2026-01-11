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
    "Publish your newsletter and instantly record it on the web. A personal branding platform that's also indexed by search engines.",
  keywords: [
    "newsletter",
    "blog",
    "archive",
    "personal branding",
    "SEO",
    "creator",
  ],
  authors: [{ name: "Vality" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vality.io",
    siteName: "Vality",
    title: "Vality - Newsletter",
    description:
      "A simple newsletter platform built for discovery and long-term growth.",
    images: [
      {
        url: "https://vality.io/og-default.svg",
        width: 1200,
        height: 630,
        alt: "Vality",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vality - Newsletter",
    description:
      "A simple newsletter platform built for discovery and long-term growth.",
    images: [
      {
        url: "https://vality.io/og-default.svg",
        width: 1200,
        height: 630,
        alt: "Vality",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/logo.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/logo.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/logo.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    shortcut: "/logo.svg",
    apple: [
      { url: "/logo.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
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
