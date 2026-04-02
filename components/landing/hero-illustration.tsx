"use client";

import React from "react";
import { motion } from "framer-motion";

export const HeroIllustration = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        type: "spring",
        stiffness: 100,
      },
    }),
    float: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2,
      },
    },
  };

  const cards = [
    {
      id: 1,
      rotation: -8,
      x: 0,
      y: 0,
      color: "bg-indigo-500",
      icon: "📝",
    },
    {
      id: 2,
      rotation: 4,
      x: 80,
      y: 60,
      color: "bg-emerald-500",
      icon: "✅",
    },
    {
      id: 3,
      rotation: -4,
      x: 40,
      y: 120,
      color: "bg-amber-500",
      icon: "🎯",
    },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 400"
        fill="none"
      >
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.1)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.1)" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#bgGradient)" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="1" className="text-indigo-200 dark:text-indigo-900" strokeDasharray="5,5" opacity="0.3" />
      </svg>

      <div className="relative w-full h-full flex items-center justify-center">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            custom={i}
            initial="hidden"
            animate={["visible", "float"]}
            variants={cardVariants}
            style={{
              rotate: card.rotation,
              x: card.x,
              y: card.y,
            }}
            className="absolute"
          >
            <div className="w-32 h-40 rounded-lg shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center justify-center gap-3">
              <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center text-2xl`}>
                {card.icon}
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white text-center">
                Question {card.id}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
