"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface ScoreRevealProps {
  score: number;
  maxScore: number;
}

export function ScoreReveal({ score, maxScore }: ScoreRevealProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (score / maxScore) * circumference;

  useEffect(() => {
    // Trigger animation when component mounts
    const timer = setTimeout(() => {
      setHasTriggered(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Animate counter
  useEffect(() => {
    if (!hasTriggered) return;

    const increment = score / 30; // Animate over ~30 frames
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, 30);

    return () => clearInterval(timer);
  }, [hasTriggered, score]);

  // Confetti effect for high scores
  useEffect(() => {
    if (score >= 70 && hasTriggered) {
      createConfetti();
    }
  }, [score, hasTriggered]);

  const createConfetti = () => {
    // Simple CSS-based confetti (can be enhanced with canvas-confetti library)
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement("div");
      confetti.style.position = "fixed";
      confetti.style.width = "10px";
      confetti.style.height = "10px";
      confetti.style.backgroundColor = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFE66D"][
        Math.floor(Math.random() * 4)
      ];
      confetti.style.left = Math.random() * 100 + "%";
      confetti.style.top = "-10px";
      confetti.style.borderRadius = "50%";
      confetti.style.pointerEvents = "none";
      confetti.style.zIndex = "9999";

      document.body.appendChild(confetti);

      const animation = confetti.animate(
        [
          { transform: "translateY(0) rotate(0deg)", opacity: 1 },
          { transform: `translateY(${window.innerHeight}px) rotate(720deg)`, opacity: 0 },
        ],
        {
          duration: 3000,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }
      );

      animation.onfinish = () => confetti.remove();
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4">
      {/* Circular Progress Ring */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted-foreground opacity-20"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="3"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={
              hasTriggered
                ? { strokeDashoffset }
                : { strokeDashoffset: circumference }
            }
            transition={{ duration: 1.5, ease: "easeInOut" }}
            strokeLinecap="round"
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
          />
          {/* Gradient */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={hasTriggered ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="text-4xl font-bold text-indigo-600">
              {displayScore}
              <span className="text-2xl text-muted-foreground">%</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Subtitle */}
      <motion.p
        className="text-lg font-semibold text-foreground"
        initial={{ opacity: 0 }}
        animate={hasTriggered ? { opacity: 1 } : {}}
        transition={{ delay: 0.8 }}
      >
        {score >= 90
          ? "Outstanding!"
          : score >= 80
            ? "Great job!"
            : score >= 70
              ? "Good effort!"
              : score >= 60
                ? "Not bad!"
                : "Keep practicing!"}
      </motion.p>
    </div>
  );
}
