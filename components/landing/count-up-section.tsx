"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, Smile } from "lucide-react";

const useCountUp = (endValue: number, duration: number = 2) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(endValue * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, endValue, duration]);

  return { count, setIsVisible };
};

export const CountUpSection = () => {
  const { count: students, setIsVisible: setStudentsVisible } = useCountUp(10000);
  const { count: quizzes, setIsVisible: setQuizzesVisible } = useCountUp(500);
  const { count: satisfaction, setIsVisible: setSatisfactionVisible } = useCountUp(98);

  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasScrolled) {
          setStudentsVisible(true);
          setQuizzesVisible(true);
          setSatisfactionVisible(true);
          setHasScrolled(true);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById("count-up-section");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [hasScrolled, setStudentsVisible, setQuizzesVisible, setSatisfactionVisible]);

  return (
    <section
      id="count-up-section"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-slate-950"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Students */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                <Users className="h-8 w-8 text-indigo-400" />
              </div>
            </div>
            <div className="text-5xl font-bold text-white mb-2">
              {students.toLocaleString()}+
            </div>
            <p className="text-slate-400">Active learners</p>
          </motion.div>

          {/* Quizzes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
            <div className="text-5xl font-bold text-white mb-2">
              {quizzes.toLocaleString()}+
            </div>
            <p className="text-slate-400">Quizzes available</p>
          </motion.div>

          {/* Satisfaction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-lg bg-amber-600/20 flex items-center justify-center">
                <Smile className="h-8 w-8 text-amber-400" />
              </div>
            </div>
            <div className="text-5xl font-bold text-white mb-2">
              {satisfaction}%
            </div>
            <p className="text-slate-400">Satisfaction rate</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
