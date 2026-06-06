import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function BrandLogo({ className, size = "md", href = "/" }: BrandLogoProps) {
  const sizeClasses = {
    sm: { ar: "text-lg", en: "text-[10px]", ornament: "text-xs" },
    md: { ar: "text-2xl", en: "text-[11px]", ornament: "text-sm" },
    lg: { ar: "text-4xl", en: "text-sm", ornament: "text-base" },
  };
  const s = sizeClasses[size];

  return (
    <Link href={href} className={cn("flex flex-col items-center group", className)}>
      <span
        className={cn(
          "arabic-brand font-bold text-[#D6B25E] leading-tight tracking-wide group-hover:opacity-90 transition-opacity",
          s.ar
        )}
      >
        الخليجية
      </span>
      <span
        className={cn(
          "text-[#D6B25E] tracking-[0.2em] uppercase font-light leading-tight",
          s.en
        )}
      >
        Al Khalejia Fashion
      </span>
      <span className={cn("text-[#D6B25E60] mt-0.5", s.ornament)}>✦</span>
    </Link>
  );
}
