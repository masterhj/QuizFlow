"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export interface TestimonialCardProps {
  avatar: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
}

export const TestimonialCard = ({
  avatar,
  name,
  role,
  quote,
  rating,
}: TestimonialCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-2xl transition-all"
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star
            key={i}
            className="h-5 w-5 fill-amber-400 text-amber-400"
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-slate-700 dark:text-slate-300 mb-6 italic">
        "{quote}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <Avatar
          name={name}
          src={avatar}
          size="md"
        />
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {name}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {role}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
