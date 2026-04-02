"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";

import { QuestionWithOptions } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface QuestionCardProps {
  question: QuestionWithOptions;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
  isAnswered: boolean;
  correctAnswer: string | null;
  explanation: string | null;
  showExplanation: boolean;
  onToggleExplanation: () => void;
}

export const QuestionCard = React.forwardRef<HTMLDivElement, QuestionCardProps>(
  (
    {
      question,
      questionNumber,
      totalQuestions,
      selectedAnswer,
      onAnswer,
      isAnswered,
      correctAnswer,
      explanation,
      showExplanation,
      onToggleExplanation,
    },
    ref
  ) => {
    const isWrongAnswer = isAnswered && selectedAnswer && selectedAnswer !== correctAnswer;

    return (
      <Card ref={ref} variant="elevated" padding="lg" className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-600">
            Question {questionNumber} of {totalQuestions}
          </div>
          {question.difficulty && (
            <div className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              {["Easy", "Medium", "Hard", "Very Hard", "Expert"][question.difficulty - 1]}
            </div>
          )}
        </div>

        {/* Question Text */}
        <div className="text-lg font-semibold text-slate-900 leading-relaxed">
          {question.question}
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = correctAnswer === option;
            const isWrong = isSelected && isAnswered && !isCorrect;

            let borderClass = "border-slate-200";
            let bgClass = "bg-white";
            let hoverClass = "hover:border-slate-300";

            if (isAnswered) {
              if (isCorrect) {
                borderClass = isSelected ? "border-emerald-500" : "border-emerald-300 border-dashed";
                bgClass = isSelected ? "bg-emerald-50" : "bg-transparent";
              } else if (isWrong) {
                borderClass = "border-red-500";
                bgClass = "bg-red-50";
              }
            } else {
              if (isSelected) {
                borderClass = "border-indigo-600";
                bgClass = "bg-indigo-50";
              }
            }

            return (
              <motion.button
                key={index}
                onClick={() => !isAnswered && onAnswer(option)}
                disabled={isAnswered}
                animate={isWrong ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                transition={isWrong ? { duration: 0.4 } : {}}
                className={`relative rounded-lg border-2 p-4 text-left text-sm font-medium text-slate-900 transition-all ${borderClass} ${bgClass} ${
                  !isAnswered ? hoverClass : ""
                } ${isAnswered ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex-1">{option}</span>

                  {/* Result Icons */}
                  {isAnswered && isCorrect && isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    </motion.div>
                  )}

                  {isAnswered && isWrong && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <X className="h-5 w-5 text-red-600 flex-shrink-0" />
                    </motion.div>
                  )}

                  {isAnswered && isCorrect && !isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Explanation Button */}
        <AnimatePresence>
          {isAnswered && !showExplanation && explanation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Button
                onClick={onToggleExplanation}
                variant="secondary"
                size="sm"
                leftIcon={<Sparkles className="h-4 w-4" />}
                className="w-full"
              >
                Show AI Explanation
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Explanation Panel */}
        <AnimatePresence>
          {isAnswered && showExplanation && explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="rounded-lg bg-indigo-50 p-4 border border-indigo-200"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-indigo-900 mb-2">AI Explanation</p>
                  <p className="text-sm text-indigo-800 leading-relaxed">{explanation}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  }
);

QuestionCard.displayName = "QuestionCard";
