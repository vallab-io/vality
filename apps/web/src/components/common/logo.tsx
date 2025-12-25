import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  showIcon?: boolean;
  iconOnly?: boolean;
  width?: number;
  height?: number;
}

export function Logo({ 
  href = "/", 
  className,
  showIcon = true,
  iconOnly = false,
  width = 24,
  height = 24
}: LogoProps) {
  const logoContent = (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && (
        <Image
          src="/logo.svg"
          alt="Vality"
          width={width}
          height={height}
          className="object-contain"
          unoptimized
          priority
        />
      )}
      {!iconOnly && (
        <span className="text-xl font-semibold tracking-tight">Vality</span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{logoContent}</Link>;
  }

  return logoContent;
}

