"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useReview } from "@/hooks/useReview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewCard } from "@/components/quiz/review-card";
import {
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  Zap,
  ThumbsUp,
} from "lucide-react";

type GradeType = "again" | "hard" | "good" | "easy";

interface ReviewQuestion {
  id: string;
  text: string;
  type: "MCQ" | "SHORT_ANSWER";
  options?: Array<{ id: string; text: string; isCorrect: boolean }>;
  correctAnswer?: string;
  explanation?: string;
}

export default function ReviewPage() {
  const router = useRouter();
  const { questions, loading, currentIndex, gradeReview, completeSession } =
    useReview();

  const [showAnswer, setShowAnswer] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    reviewedCount: 0,
    timeStarted: Date.now(),
  });

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  // Keyboard shortcuts for grading
  useEffect(() => {
    if (showAnswer && !sessionComplete) {
      const handleKeyPress = (e: KeyboardEvent) => {
        const grades: Record<string, GradeType> = {
          "1": "again",
          "2": "hard",
          "3": "good",
          "4": "easy",
        };

        if (grades[e.key]) {
          handleGrade(grades[e.key]);
        }
      };

      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [showAnswer, sessionComplete, currentIndex]);

  const handleGrade = useCallback(async (grade: GradeType) => {
    setIsGrading(true);
    try {
      await gradeReview(currentQuestion.id, grade);

      setReviewStats((prev) => ({
        ...prev,
        reviewedCount: prev.reviewedCount + 1,
      }));

      setShowAnswer(false);

      // Check if this was the last card
      if (currentIndex >= questions.length - 1) {
        await completeSession();
        setSessionComplete(true);
      }
    } catch (error) {
      console.error("Failed to grade review:", error);
    } finally {
      setIsGrading(false);
    }
  }, [currentIndex, currentQuestion.id, questions.length, gradeReview, completeSession]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // No reviews due
  if (questions.length === 0 && !sessionComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">All caught up!</h1>
          <p className="text-muted-foreground mt-2">
            You have no cards due for review right now.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Next review:{" "}
            <span className="font-semibold">
              {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
              )}
            </span>
          </p>
          <Button className="w-full mt-6" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Session complete
  if (sessionComplete) {
    const timeTaken = Math.round((Date.now() - reviewStats.timeStarted) / 1000);
    const nextReviewDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return (
      <motion.div
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="p-12 text-center max-w-md space-y-6">
          <div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block"
            >
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-bold mt-4">Session Complete!</h1>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cards reviewed:</span>
              <span className="font-semibold">{reviewStats.reviewedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time taken:</span>
              <span className="font-semibold">
                {Math.floor(timeTaken / 60)}m {timeTaken % 60}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next session:</span>
              <span className="font-semibold">
                {nextReviewDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </Card>
      </motion.div>
    );
  }

  // Review session active
  return (
    <div className="min-h-screen flex flex-col py-8">
      <div className="max-w-2xl mx-auto w-full px-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              {questions.length - currentIndex} cards due today
            </h1>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
          <p className="text-muted-foreground">
            {reviewStats.reviewedCount} of {questions.length} reviewed
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{reviewStats.reviewedCount}</span>
            <span>{questions.length}</span>
          </div>
        </div>

        {/* Review Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion?.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <ReviewCard
              question={currentQuestion}
              showAnswer={showAnswer}
              onShowAnswer={() => setShowAnswer(true)}
              onGrade={handleGrade}
              isGrading={isGrading}
            />
          </motion.div>
        </AnimatePresence>

        {/* Grading Buttons */}
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <Button
              variant="outline"
              onClick={() => handleGrade("again")}
              disabled={isGrading}
              className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Again
              <kbd className="ml-auto text-xs bg-red-100 dark:bg-red-900 px-1 rounded">
                1
              </kbd>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleGrade("hard")}
              disabled={isGrading}
              className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Hard
              <kbd className="ml-auto text-xs bg-orange-100 dark:bg-orange-900 px-1 rounded">
                2
              </kbd>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleGrade("good")}
              disabled={isGrading}
              className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Good
              <kbd className="ml-auto text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded">
                3
              </kbd>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleGrade("easy")}
              disabled={isGrading}
              className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
            >
              <Zap className="w-4 h-4 mr-2" />
              Easy
              <kbd className="ml-auto text-xs bg-green-100 dark:bg-green-900 px-1 rounded">
                4
              </kbd>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
