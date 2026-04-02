import { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import type { ReviewSession } from "@/types";
import type { ReviewGradeInput } from "@/lib/validations";

interface UseReviewSessionReturn {
  reviews: ReviewSession[];
  current: ReviewSession | null;
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  isComplete: boolean;
  progress: {
    done: number;
    total: number;
    percentage: number;
  };
  submitGrade: (grade: 0 | 1 | 2 | 3 | 4 | 5) => Promise<void>;
  skipQuestion: () => void;
}

/**
 * Hook for managing spaced repetition review sessions
 */
export function useReviewSession(): UseReviewSessionReturn {
  const [reviews, setReviews] = useState<ReviewSession[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addNotification } = useUserStore();

  // Fetch due reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/review/schedule");

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();
        setReviews(data.reviews || []);
        setCurrentIndex(0);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch reviews";
        setError(errorMessage);
        addNotification(errorMessage, "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [addNotification]);

  const current = reviews[currentIndex] || null;
  const isComplete = reviews.length === 0 || currentIndex >= reviews.length;

  const progress = {
    done: Math.min(currentIndex, reviews.length),
    total: reviews.length,
    percentage: reviews.length > 0 ? (currentIndex / reviews.length) * 100 : 0,
  };

  const submitGrade = useCallback(
    async (grade: 0 | 1 | 2 | 3 | 4 | 5) => {
      if (!current) return;

      setIsSubmitting(true);
      setError(null);

      try {
        const payload: ReviewGradeInput = {
          reviewId: current.questionId, // Assuming reviewId is available on the review
          grade,
        };

        const response = await fetch("/api/review/grade", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to submit grade");
        }

        addNotification("Review saved!", "success");

        // Move to next review
        if (currentIndex + 1 < reviews.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // All reviews complete
          setCurrentIndex(reviews.length);
          addNotification("All reviews completed! Great work.", "success");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to submit grade";
        setError(errorMessage);
        addNotification(errorMessage, "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [current, currentIndex, reviews.length, addNotification]
  );

  const skipQuestion = useCallback(() => {
    if (currentIndex + 1 < reviews.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(reviews.length);
    }
  }, [currentIndex, reviews.length]);

  return {
    reviews,
    current,
    currentIndex,
    isLoading: isLoading || isSubmitting,
    error,
    isComplete,
    progress,
    submitGrade,
    skipQuestion,
  };
}

/**
 * Hook for getting review statistics
 */
export function useReviewStats() {
  const [stats, setStats] = useState<{
    due: number;
    completed: number;
    nextReviewDate: Date | null;
  }>({
    due: 0,
    completed: 0,
    nextReviewDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/review/stats");

        if (!response.ok) {
          throw new Error("Failed to fetch review stats");
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch review stats";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return {
    ...stats,
    isLoading,
    error,
  };
}

// Alias for compatibility
export const useReview = useReviewSession;
