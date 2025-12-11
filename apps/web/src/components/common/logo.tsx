import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href = "/", className }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("text-xl font-semibold tracking-tight", className)}
    >
      Vality
    </Link>
  );
}

