import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full font-semibold",
  {
    variants: {
      variant: {
        default: "bg-indigo-100 text-indigo-900",
        success: "bg-emerald-100 text-emerald-900",
        warning: "bg-amber-100 text-amber-900",
        danger: "bg-red-100 text-red-900",
        info: "bg-blue-100 text-blue-900",
        purple: "bg-purple-100 text-purple-900",
      },
      size: {
        sm: "px-2.5 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, dot = false, children, ...props }, ref) => (
    <div ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", {
            "bg-indigo-500": variant === "default",
            "bg-emerald-500": variant === "success",
            "bg-amber-500": variant === "warning",
            "bg-red-500": variant === "danger",
            "bg-blue-500": variant === "info",
            "bg-purple-500": variant === "purple",
          })}
        />
      )}
      {children}
    </div>
  )
);

Badge.displayName = "Badge";
