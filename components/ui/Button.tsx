import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type Variant = "gold" | "outline" | "ghost" | "danger" | "dark";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  gold: "bg-[#D6B25E] hover:bg-[#A9822B] text-[#050505] font-semibold border border-transparent shadow-sm",
  outline:
    "bg-transparent border border-[#D6B25E] text-[#D6B25E] hover:bg-[#D6B25E10] font-medium",
  ghost: "bg-transparent hover:bg-[#D6B25E15] text-[#D6B25E] font-medium",
  danger:
    "bg-red-600 hover:bg-red-700 text-white font-semibold border border-transparent",
  dark: "bg-[#050505] hover:bg-[#1a1a1a] text-[#D6B25E] border border-[#D6B25E30] font-semibold",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded",
  md: "px-5 py-2.5 text-sm rounded",
  lg: "px-7 py-3.5 text-base rounded",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "gold", size = "md", loading, className, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
