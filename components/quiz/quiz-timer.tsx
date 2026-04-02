"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface QuizTimerProps {
  onTimeUp?: () => void;
  warningAt?: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const QuizTimer = React.forwardRef<HTMLDivElement, QuizTimerProps>(
  ({ onTimeUp, warningAt = 60 }, ref) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
      // Initialize from localStorage or 30 minutes
      const stored = localStorage.getItem("quizTimeLeft");
      const initialTime = stored ? parseInt(stored) : 30 * 60;
      setTimeLeft(initialTime);
    }, []);

    useEffect(() => {
      if (timeLeft === null) return;

      if (timeLeft === 0) {
        onTimeUp?.();
        return;
      }

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (!prev || prev <= 0) return 0;
          const newTime = prev - 1;
          localStorage.setItem("quizTimeLeft", newTime.toString());
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }, [timeLeft, onTimeUp]);

    if (timeLeft === null) return null;

    const isWarning = timeLeft <= warningAt && timeLeft > 30;
    const isCritical = timeLeft <= 30;

    return (
      <div ref={ref} className="flex items-center gap-2">
        <motion.div
          animate={{
            scale: isCritical ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: isCritical ? 1 : 0,
            repeat: isCritical ? Infinity : 0,
          }}
          className={cn(
            "text-lg font-mono font-semibold px-4 py-2 rounded-lg transition-colors",
            isCritical
              ? "bg-red-50 text-red-700"
              : isWarning
              ? "bg-amber-50 text-amber-700"
              : "bg-slate-50 text-slate-700"
          )}
        >
          {formatTime(timeLeft)}
        </motion.div>

        {isCritical && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded"
          >
            Time's running out!
          </motion.div>
        )}

        {isWarning && !isCritical && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded"
          >
            Less than {Math.floor(warningAt / 60)} min left
          </motion.div>
        )}
      </div>
    );
  }
);

QuizTimer.displayName = "QuizTimer";
