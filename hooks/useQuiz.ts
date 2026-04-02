import { useCallback, useState } from "react";
import { useQuizStore } from "@/stores/quizStore";
import { useUserStore } from "@/stores/userStore";
import type { SubmitAnswerInput, CompleteAttemptInput } from "@/lib/validations";

interface UseQuizSessionReturn {
  currentQuestion: ReturnType<typeof useQuizStore.getState>["getCurrentQuestion"] | null;
  progress: ReturnType<typeof useQuizStore.getState>["getProgress"];
  totalTime: number;
  isSubmitting: boolean;
  error: string | null;
  submitAnswer: (questionId: string, answer: string, isCorrect: boolean) => Promise<void>;
  completeQuiz: () => Promise<{
    score: number;
    correctCount: number;
    totalQuestions: number;
    xpGained: number;
  } | null>;
  goToNext: () => void;
  goToPrevious: () => void;
  showExplanation: boolean;
  toggleExplanation: () => void;
}

/**
 * Hook for managing an active quiz session
 */
export function useQuizSession(): UseQuizSessionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quizStore = useQuizStore();
  const { addNotification } = useUserStore();

  const currentQuestion = quizStore.getCurrentQuestion();
  const progress = quizStore.getProgress();
  const totalTime = quizStore.getTotalTime();

  const submitAnswer = useCallback(
    async (questionId: string, answer: string, isCorrect: boolean) => {
      if (!quizStore.currentAttemptId || !quizStore.currentQuiz) return;

      setIsSubmitting(true);
      setError(null);

      try {
        const payload: SubmitAnswerInput = {
          questionId,
          userAnswer: answer,
          timeSpentSeconds: 0, // Could track per-question time if needed
        };

        const response = await fetch(
          `/api/quiz/${quizStore.currentQuiz.id}/attempt/${quizStore.currentAttemptId}/answer`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to submit answer");
        }

        // Update store with answer
        quizStore.submitAnswer(questionId, answer, 0, isCorrect);

        // Move to next question after a brief delay
        setTimeout(() => {
          quizStore.nextQuestion();
        }, 500);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to submit answer";
        setError(errorMessage);
        addNotification(errorMessage, "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [quizStore, addNotification]
  );

  const completeQuiz = useCallback(async () => {
    if (!quizStore.currentAttemptId || !quizStore.currentQuiz) return null;

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare all answers for submission
      const answers = Array.from(quizStore.answers.entries()).map(
        ([questionId, { answer, timeSpent }]) => ({
          questionId,
          userAnswer: answer,
          timeSpentSeconds: timeSpent,
        })
      );

      const payload: CompleteAttemptInput = {
        attemptId: quizStore.currentAttemptId,
        answers,
      };

      const response = await fetch(
        `/api/quiz/${quizStore.currentQuiz.id}/attempt/${quizStore.currentAttemptId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to complete quiz");
      }

      const result = await response.json();
      addNotification("Quiz completed! Check your results.", "success");
      quizStore.resetQuiz();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to complete quiz";
      setError(errorMessage);
      addNotification(errorMessage, "error");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [quizStore, addNotification]);

  const goToNext = useCallback(() => {
    quizStore.nextQuestion();
  }, [quizStore]);

  const goToPrevious = useCallback(() => {
    quizStore.prevQuestion();
  }, [quizStore]);

  const toggleExplanation = useCallback(() => {
    quizStore.setShowExplanation(!quizStore.showExplanation);
  }, [quizStore]);

  return {
    currentQuestion,
    progress,
    totalTime,
    isSubmitting,
    error,
    submitAnswer,
    completeQuiz,
    goToNext,
    goToPrevious,
    showExplanation: quizStore.showExplanation,
    toggleExplanation,
  };
}
