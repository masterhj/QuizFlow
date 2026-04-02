"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/stores/quizStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";
import { OptionButton } from "@/components/quiz/option-button";
import { X, CheckCircle2, XCircle } from "lucide-react";

interface QuizQuestion {
  id: string;
  text: string;
  type: "MCQ" | "SHORT_ANSWER" | "TRUE_FALSE";
  difficulty: number;
  order: number;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    order: number;
  }>;
  correctAnswer?: string;
}

interface Quiz {
  id: string;
  title: string;
  difficulty: number;
  questions: QuizQuestion[];
  creator: { id: string; name: string };
}

interface ExistingAnswer {
  id: string;
  questionId: string;
  selectedOptionId?: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

interface QuizAttemptClientProps {
  attemptId: string;
  quiz: Quiz;
  existingAnswers: ExistingAnswer[];
  userId: string;
}

export function QuizAttemptClient({
  attemptId,
  quiz,
  existingAnswers,
  userId,
}: QuizAttemptClientProps) {
  const router = useRouter();
  const {
    currentQuestionIndex,
    selectedAnswer,
    setCurrentQuestion,
    setSelectedAnswer,
    difficulty,
    setDifficulty,
  } = useQuizStore();

  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    emoji?: string;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const timerRef = useRef<NodeJS.Timeout>();
  const [shortAnswer, setShortAnswer] = useState("");
  const [submittedAnswers, setSubmittedAnswers] = useState<
    Record<string, { optionId?: string; answer?: string; isCorrect?: boolean }>
  >({});

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  // Timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle option selection for MCQ
  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (!answered) {
        setSelectedAnswer(optionId);
      }
    },
    [answered, setSelectedAnswer]
  );

  // Fetch AI explanation
  const fetchExplanation = async (
    questionId: string,
    correctAnswer: string
  ) => {
    setLoadingExplanation(true);
    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          correctAnswer,
          questionText: currentQuestion.text,
        }),
      });

      const data = await response.json();
      setExplanation(data.explanation || "");
      setShowExplanation(true);
    } catch (error) {
      console.error("Failed to fetch explanation:", error);
      setExplanation("Could not load explanation. Please try again.");
      setShowExplanation(true);
    } finally {
      setLoadingExplanation(false);
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    let isCorrect = false;
    let answerValue = selectedAnswer || shortAnswer;

    if (currentQuestion.type === "MCQ" || currentQuestion.type === "TRUE_FALSE") {
      const selected = currentQuestion.options.find(
        (opt) => opt.id === selectedAnswer
      );
      isCorrect = selected?.isCorrect ?? false;
    }

    // Save answer to database
    await fetch(`/api/quiz/${quiz.id}/attempt/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId,
        questionId: currentQuestion.id,
        selectedOptionId: currentQuestion.type !== "SHORT_ANSWER" ? selectedAnswer : undefined,
        userAnswer: currentQuestion.type === "SHORT_ANSWER" ? shortAnswer : undefined,
        isCorrect,
      }),
    });

    setSubmittedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { optionId: selectedAnswer, answer: shortAnswer, isCorrect },
    }));

    setAnswered(true);

    // Check for difficulty change
    const newDifficulty = isCorrect
      ? Math.min(difficulty + 1, 5)
      : Math.max(difficulty - 1, 1);

    if (newDifficulty !== difficulty) {
      setDifficulty(newDifficulty);
      const emoji = newDifficulty > difficulty ? "🎯" : "💪";
      const message =
        newDifficulty > difficulty
          ? "Difficulty increased!"
          : "Taking it easier";
      setToast({ message, emoji });
      setTimeout(() => setToast(null), 3000);
    }

    // Fetch explanation for MCQ
    if (currentQuestion.type === "MCQ" || currentQuestion.type === "TRUE_FALSE") {
      const correct = currentQuestion.options.find((opt) => opt.isCorrect);
      if (correct) {
        fetchExplanation(currentQuestion.id, correct.text);
      }
    }
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Complete attempt
      fetch(`/api/quiz/${quiz.id}/attempt/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          timeSpentSeconds: 30 * 60 - timeRemaining,
        }),
      }).then(() => {
        router.push(`/quiz/${quiz.id}/results?attemptId=${attemptId}`);
      });
    } else {
      setCurrentQuestion(currentQuestionIndex + 1);
      setSelectedAnswer("");
      setShortAnswer("");
      setAnswered(false);
      setShowExplanation(false);
      setExplanation(null);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (answered) {
        if (e.key === "Enter") {
          handleNextQuestion();
        }
        return;
      }

      if (currentQuestion.type === "MCQ" || currentQuestion.type === "TRUE_FALSE") {
        const keyMap: Record<string, number> = {
          "1": 0,
          "2": 1,
          "3": 2,
          "4": 3,
        };

        if (keyMap[e.key] !== undefined) {
          const optionIndex = keyMap[e.key];
          if (optionIndex < currentQuestion.options.length) {
            handleSelectOption(currentQuestion.options[optionIndex].id);
          }
        }
      }

      if (e.key === "Enter" && selectedAnswer) {
        handleSubmitAnswer();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [answered, selectedAnswer, currentQuestionIndex, currentQuestion, handleSelectOption]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-card border-b sticky top-0 z-40">
        <div className="px-6 py-3 space-y-3">
          {/* Progress Bar */}
          <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Top controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Question {currentQuestionIndex + 1}/{quiz.questions.length}
              </Badge>
              <div className="text-xs text-muted-foreground">
                Difficulty:{" "}
                <span className="font-semibold">
                  {difficulty}/5
                  {"★".repeat(difficulty)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm font-mono text-muted-foreground">
                {formatTime(timeRemaining)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExitModal(true)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <motion.div
          className="w-full max-w-2xl space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Question Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Q{currentQuestionIndex + 1}</Badge>
              <div className="w-3 h-3 rounded-full bg-amber-500" />
            </div>
            <h2 className="text-2xl font-medium leading-relaxed">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Question Content */}
          {currentQuestion.type === "SHORT_ANSWER" ? (
            <div className="space-y-3">
              <textarea
                value={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.value)}
                placeholder="Type your answer here..."
                disabled={answered}
                className="w-full p-4 rounded-lg border bg-background disabled:opacity-50"
                rows={4}
              />
              {!answered && (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!shortAnswer.trim()}
                  className="w-full"
                >
                  Submit Answer
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((option, idx) => (
                <OptionButton
                  key={option.id}
                  letter={String.fromCharCode(65 + idx)} // A, B, C, D
                  text={option.text}
                  isSelected={selectedAnswer === option.id}
                  isCorrect={option.isCorrect}
                  isAnswered={answered}
                  userSelected={selectedAnswer === option.id}
                  onClick={() => handleSelectOption(option.id)}
                  disabled={answered}
                />
              ))}
            </div>
          )}

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <Card className="p-6 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Explanation
                  </h3>
                  {loadingExplanation ? (
                    <div className="text-sm text-muted-foreground">
                      Loading explanation...
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {explanation}
                    </p>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {answered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 pt-4"
            >
              <Button
                onClick={handleNextQuestion}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {isLastQuestion ? "See Results" : "Next Question"}
              </Button>
            </motion.div>
          )}

          {!answered && selectedAnswer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Button
                onClick={handleSubmitAnswer}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Submit Answer
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Exit Modal */}
      <Modal
        open={showExitModal}
        onOpenChange={setShowExitModal}
        title="Exit Quiz?"
        description="Your progress will be saved. Are you sure you want to exit?"
      >
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowExitModal(false)}
            className="flex-1"
          >
            Continue Quiz
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setShowExitModal(false);
              router.back();
            }}
            className="flex-1"
          >
            Exit
          </Button>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <motion.div
          className="fixed bottom-6 right-6 bg-card border rounded-lg p-4 shadow-lg flex items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          {toast.emoji && <span className="text-xl">{toast.emoji}</span>}
          <span className="text-sm font-medium">{toast.message}</span>
        </motion.div>
      )}
    </div>
  );
}
