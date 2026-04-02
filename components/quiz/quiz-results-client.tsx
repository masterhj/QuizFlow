"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreReveal } from "@/components/quiz/score-reveal";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CheckCircle2, XCircle, Clock, Zap, Share2 } from "lucide-react";

interface AttemptAnswer {
  id: string;
  questionId: string;
  selectedOptionId?: string;
  userAnswer?: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  type: "MCQ" | "SHORT_ANSWER" | "TRUE_FALSE";
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

interface Attempt {
  id: string;
  quiz: {
    title: string;
    subject: string;
    questions: QuizQuestion[];
  };
  answers: AttemptAnswer[];
}

interface TopicMastery {
  id: string;
  topic: string;
  masteryLevel: number;
}

interface RecommendedQuiz {
  id: string;
  title: string;
  subject: string;
  difficulty: number;
  _count: {
    questions: number;
    attempts: number;
  };
}

interface QuizResultsClientProps {
  attempt: Attempt;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTakenMinutes: number;
  xpGained: number;
  topicMasteries: TopicMastery[];
  recommendedQuizzes: RecommendedQuiz[];
  quizId: string;
}

export function QuizResultsClient({
  attempt,
  score,
  correctAnswers,
  totalQuestions,
  timeTakenMinutes,
  xpGained,
  topicMasteries,
  recommendedQuizzes,
  quizId,
}: QuizResultsClientProps) {
  const wrongAnswers = totalQuestions - correctAnswers;
  const grade =
    score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";

  const handleShare = async () => {
    const text = `I scored ${score}% on "${attempt.quiz.title}" quiz! 🎉`;
    const url = `${window.location.origin}/quiz/${quizId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Quiz Result",
          text,
          url,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${text} ${url}`);
      alert("Result link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 dark:from-indigo-950/20">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Score Reveal Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-12 text-center">
            <ScoreReveal score={score} maxScore={100} />

            <div className="mt-6">
              <Badge
                className={`text-lg px-4 py-2 ${
                  grade === "A"
                    ? "bg-green-600 hover:bg-green-700"
                    : grade === "B"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : grade === "C"
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : grade === "D"
                          ? "bg-orange-600 hover:bg-orange-700"
                          : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Grade: {grade}
              </Badge>
            </div>

            <p className="text-muted-foreground mt-4">
              {correctAnswers} out of {totalQuestions} correct
            </p>
          </Card>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="p-4 text-center space-y-2 border-green-200 dark:border-green-900">
            <div className="flex justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </Card>

          <Card className="p-4 text-center space-y-2 border-red-200 dark:border-red-900">
            <div className="flex justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{wrongAnswers}</p>
            <p className="text-xs text-muted-foreground">Wrong</p>
          </Card>

          <Card className="p-4 text-center space-y-2 border-blue-200 dark:border-blue-900">
            <div className="flex justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{timeTakenMinutes}m</p>
            <p className="text-xs text-muted-foreground">Time Taken</p>
          </Card>

          <Card className="p-4 text-center space-y-2 border-yellow-200 dark:border-yellow-900">
            <div className="flex justify-center">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">+{xpGained}</p>
            <p className="text-xs text-muted-foreground">XP Earned</p>
          </Card>
        </motion.div>

        {/* Mastery Update Panel */}
        {topicMasteries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-bold">Topic Mastery</h2>
              <div className="space-y-4">
                {topicMasteries.map((topic) => (
                  <div key={topic.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{topic.topic}</p>
                      <span className="text-sm font-bold text-indigo-600">
                        {topic.masteryLevel}%
                      </span>
                    </div>
                    <motion.div
                      className="w-full bg-muted h-2 rounded-full overflow-hidden"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        className="h-full bg-indigo-600"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${topic.masteryLevel}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        viewport={{ once: true }}
                      />
                    </motion.div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Question Review Accordion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Question Review</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {attempt.quiz.questions.map((question, idx) => {
                const answer = attempt.answers.find((a) => a.questionId === question.id);
                const isCorrect = answer?.isCorrect ?? false;

                return (
                  <AccordionItem key={question.id} value={question.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left flex-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          Q{idx + 1}
                        </span>
                        <span className="flex-1 line-clamp-1">{question.text}</span>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      {/* Full Question */}
                      <div>
                        <p className="text-sm font-medium mb-2">Question:</p>
                        <p className="text-sm text-muted-foreground">
                          {question.text}
                        </p>
                      </div>

                      {/* User Answer */}
                      <div>
                        <p className="text-sm font-medium mb-2">Your Answer:</p>
                        {question.type === "SHORT_ANSWER" ? (
                          <p
                            className={`text-sm p-3 rounded-lg ${
                              isCorrect
                                ? "bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100"
                                : "bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100"
                            }`}
                          >
                            {answer?.userAnswer || "No answer provided"}
                          </p>
                        ) : (
                          <div>
                            {question.options.map((option) => {
                              const isUserSelected =
                                answer?.selectedOptionId === option.id;
                              return (
                                <div
                                  key={option.id}
                                  className={`text-sm p-2 rounded mb-1 ${
                                    isUserSelected
                                      ? option.isCorrect
                                        ? "bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100"
                                        : "bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100"
                                      : option.isCorrect
                                        ? "bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100"
                                        : ""
                                  }`}
                                >
                                  {isUserSelected ? "✓ " : ""}{option.text}
                                  {option.isCorrect && !isUserSelected ? " (Correct)" : ""}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Explanation */}
                      {answer?.explanation && (
                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-900">
                          <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                            Explanation:
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {answer.explanation}
                          </p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href={`/quiz/${quizId}/attempt`}>
            <Button size="lg">Retake Quiz</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              Back to Dashboard
            </Button>
          </Link>
          <Button variant="ghost" size="lg" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Result
          </Button>
        </motion.div>

        {/* Recommended Quizzes */}
        {recommendedQuizzes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Explore more quizzes in {attempt.quiz.subject}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedQuizzes.map((quiz) => (
                  <Link key={quiz.id} href={`/quiz/${quiz.id}`}>
                    <Card className="p-4 hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer h-full">
                      <div className="space-y-2">
                        <h3 className="font-semibold line-clamp-2">
                          {quiz.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{quiz._count.questions} questions</span>
                          <span>{"★".repeat(quiz.difficulty)}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
