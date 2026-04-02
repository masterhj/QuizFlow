import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const skeletonVariants = cva("bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200", {
  variants: {
    variant: {
      text: "h-4 rounded",
      card: "h-40 rounded-lg",
      circle: "h-10 w-10 rounded-full",
      line: "h-3 rounded",
    },
  },
  defaultVariants: {
    variant: "text",
  },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  lines?: number;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, lines, ...props }, ref) => {
    if (variant === "text" && lines && lines > 1) {
      return (
        <div className="space-y-2" {...props}>
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <div
              key={i}
              className={cn(skeletonVariants({ variant: "line" }), "w-full")}
              style={{
                animation: "shimmer 2s infinite",
                backgroundSize: "200% 100%",
              }}
            />
          ))}
          <div
            className={cn(skeletonVariants({ variant: "text" }), "w-3/4")}
            style={{
              animation: "shimmer 2s infinite",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant }), className)}
        style={{
          animation: "shimmer 2s infinite",
          backgroundSize: "200% 100%",
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";
