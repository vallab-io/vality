import Link from "next/link";
import { FOOTER_LINKS } from "@/constants/navigation";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <p className="text-sm text-muted-foreground">© 2025 Vality</p>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
