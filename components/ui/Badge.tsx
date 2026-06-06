import { cn } from "@/lib/utils";

type BadgeVariant = "gold" | "green" | "blue" | "red" | "gray" | "purple" | "yellow";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  gold: "bg-[#D6B25E20] text-[#A9822B] border border-[#D6B25E40]",
  green: "bg-green-100 text-green-800 border border-green-200",
  blue: "bg-blue-100 text-blue-800 border border-blue-200",
  red: "bg-red-100 text-red-800 border border-red-200",
  gray: "bg-gray-100 text-gray-700 border border-gray-200",
  purple: "bg-purple-100 text-purple-800 border border-purple-200",
  yellow: "bg-yellow-100 text-yellow-800 border border-yellow-200",
};

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
