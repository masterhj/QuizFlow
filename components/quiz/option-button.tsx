"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface OptionButtonProps {
  letter: string;
  text: string;
  isSelected: boolean;
  isCorrect: boolean;
  isAnswered: boolean;
  userSelected: boolean;
  onClick: () => void;
  disabled: boolean;
}

export function OptionButton({
  letter,
  text,
  isSelected,
  isCorrect,
  isAnswered,
  userSelected,
  onClick,
  disabled,
}: OptionButtonProps) {
  // Determine styles based on state
  let borderColor = "border-border";
  let bgColor = "bg-background hover:bg-muted";
  let textColor = "text-foreground";

  if (isAnswered) {
    if (userSelected && isCorrect) {
      borderColor = "border-green-500 dark:border-green-400";
      bgColor = "bg-green-50 dark:bg-green-950";
      textColor = "text-green-900 dark:text-green-100";
    } else if (userSelected && !isCorrect) {
      borderColor = "border-red-500 dark:border-red-400";
      bgColor = "bg-red-50 dark:bg-red-950";
      textColor = "text-red-900 dark:text-red-100";
    } else if (!userSelected && isCorrect) {
      borderColor = "border-green-500 dark:border-green-400";
      bgColor = "bg-green-50 dark:bg-green-950";
      textColor = "text-green-900 dark:text-green-100";
      bgColor = "bg-green-100 dark:bg-green-900";
    } else {
      borderColor = "border-border";
      bgColor = "bg-muted";
      textColor = "text-muted-foreground";
    }
  } else if (isSelected) {
    borderColor = "border-indigo-600 dark:border-indigo-400";
    bgColor = "bg-indigo-50 dark:bg-indigo-950";
    textColor = "text-indigo-900 dark:text-indigo-100";
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`
        p-4 rounded-xl border-2 transition-all text-left
        ${borderColor} ${bgColor} ${textColor}
        flex items-start gap-4 w-full
        disabled:cursor-not-allowed
      `}
    >
      {/* Letter Badge */}
      <div className="flex-shrink-0 mt-1">
        <Badge
          variant="outline"
          className="text-base font-bold w-10 h-10 flex items-center justify-center rounded-lg"
        >
          {letter}
        </Badge>
      </div>

      {/* Text Content */}
      <div className="flex-1 text-sm font-medium leading-relaxed">
        {text}
      </div>

      {/* Result Icon */}
      {isAnswered && userSelected && (
        <div className="flex-shrink-0">
          {isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
        </div>
      )}
      {isAnswered && !userSelected && isCorrect && (
        <div className="flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      )}
    </motion.button>
  );
}
