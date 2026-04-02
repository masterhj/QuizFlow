import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  name: string;
  alt?: string;
}

// Deterministic color selection based on name hash
const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-cyan-500",
    "bg-purple-500",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name (first letter per word, max 2 chars)
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, name, alt, ...props }, ref) => {
    const initials = getInitials(name);
    const bgColor = getAvatarColor(name);

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        title={name}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <div className={cn("w-full h-full rounded-full flex items-center justify-center text-white", bgColor)}>
            {initials}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
