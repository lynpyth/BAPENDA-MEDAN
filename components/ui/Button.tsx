import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "glass" | "zinc";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  loading?: boolean;
  icon?: React.ReactNode;
  confirmText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, icon, confirmText, children, onClick, ...props }, ref) => {
    const variants = {
      primary: "bg-[#1E40AF] text-white hover:bg-[#153084] shadow-sm border border-transparent",
      secondary: "bg-white border border-zinc-200 text-zinc-700 hover:bg-blue-50/50 hover:text-[#1E40AF] hover:border-blue-200",
      zinc: "bg-zinc-950 text-white hover:bg-zinc-800 active:scale-95 shadow-sm border border-transparent",
      outline: "bg-white border border-zinc-200 text-zinc-700 hover:bg-blue-50/50 hover:text-[#1E40AF] hover:border-blue-200",
      ghost: "hover:bg-zinc-100 text-muted-foreground hover:text-foreground border border-transparent",
      destructive: "bg-[#EF4444] text-white hover:bg-red-600 shadow-sm border border-transparent",
      glass: "bg-white/20 backdrop-blur-md border border-white/40 text-foreground hover:bg-white/30 shadow-sm",
    };

    // Consistent height rule: h-11 for all standard buttons, w-11 h-11 for icon button
    const sizes = {
      sm: "h-11 px-4 text-xs font-semibold rounded-xl",
      md: "h-11 px-6 text-xs font-semibold rounded-xl",
      lg: "h-11 px-8 text-sm font-semibold rounded-xl",
      xl: "h-11 px-10 text-sm font-semibold rounded-xl",
      icon: "w-11 h-11 rounded-xl flex items-center justify-center p-0",
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (confirmText) {
        const ok = window.confirm(confirmText);
        if (!ok) {
          e.preventDefault();
          return;
        }
      }
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-98 cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={loading || props.disabled}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          icon && <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
