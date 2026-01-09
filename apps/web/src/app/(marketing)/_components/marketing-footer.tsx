"use client";

import Link from "next/link";
import { useT } from "@/hooks/use-translation";

interface MarketingFooterProps {
  className?: string;
}

export function MarketingFooter({ className }: MarketingFooterProps) {
  const t = useT();

  return (
    <footer className={`border-t border-border ${className || ""}`}>
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <p className="text-sm text-muted-foreground">© 2026 Vality</p>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground">
            {t("footer.terms")}
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            {t("footer.privacy")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
