"use client";

import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DifficultyStarsProps {
  difficulty: 1 | 2 | 3 | 4 | 5;
  size?: "sm" | "md";
}

const getDifficultyLabel = (difficulty: number): string => {
  const labels = ["", "Easy", "Medium", "Hard", "Very Hard", "Expert"];
  return labels[difficulty] || "";
};

const getDifficultyColor = (difficulty: number, filled: boolean): string => {
  if (!filled) return "text-slate-300";

  if (difficulty <= 2) return "text-emerald-500";
  if (difficulty === 3) return "text-amber-500";
  return "text-red-500";
};

export const DifficultyStar = React.forwardRef<HTMLDivElement, DifficultyStarsProps>(
  ({ difficulty, size = "md" }, ref) => {
    const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

    return (
      <div ref={ref} className="flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                sizeClass,
                getDifficultyColor(difficulty, star <= difficulty),
                star <= difficulty ? "fill-current" : ""
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-slate-700">
          {getDifficultyLabel(difficulty)}
        </span>
      </div>
    );
  }
);

DifficultyStar.displayName = "DifficultyStar";

// Alias for backward compatibility
export const DifficultyStars = DifficultyStar;
