import { create } from "zustand";
import type {
  QuizWithQuestions,
  AdaptiveState,
  QuizStoreState,
  QuizStoreActions,
} from "@/types";
import {
  initializeAdaptiveState,
  updateAdaptiveState,
} from "@/lib/adaptive";

interface QuizStoreAnswers {
  answer: string;
  timeSpent: number;
  isCorrect?: boolean;
}

interface QuizStore extends QuizStoreState, QuizStoreActions {
  currentAttemptId: string | null;
  currentQuestionIndex: number;
  answers: Map<string, QuizStoreAnswers>;
  adaptive: AdaptiveState;
  sessionStartTime: number | null;
  showExplanation: boolean;

  // Derived/getter methods
  getCurrentQuestion: () => ReturnType<typeof import("@prisma/client").Question.prototype> | null;
  getProgress: () => {
    current: number;
    total: number;
    percentage: number;
  };
  getTotalTime: () => number;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  // Initial state
  currentQuiz: null,
  currentAttempt: null,
  selectedAnswers: {},
  isLoading: false,
  error: null,
  currentAttemptId: null,
  currentQuestionIndex: 0,
  answers: new Map(),
  adaptive: initializeAdaptiveState(3),
  sessionStartTime: null,
  showExplanation: false,

  // Actions
  setCurrentQuiz: (quiz) =>
    set({
      currentQuiz: quiz,
      currentQuestionIndex: 0,
    }),

  setCurrentAttempt: (attempt) =>
    set({
      currentAttempt: attempt,
    }),

  selectAnswer: (questionId, answer) =>
    set((state) => ({
      selectedAnswers: {
        ...state.selectedAnswers,
        [questionId]: answer,
      },
    })),

  clearAnswers: () =>
    set({
      selectedAnswers: {},
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  setError: (error) =>
    set({
      error,
    }),

  reset: () =>
    set({
      currentQuiz: null,
      currentAttempt: null,
      selectedAnswers: {},
      isLoading: false,
      error: null,
      currentAttemptId: null,
      currentQuestionIndex: 0,
      answers: new Map(),
      adaptive: initializeAdaptiveState(3),
      sessionStartTime: null,
      showExplanation: false,
    }),

  startQuiz: (quiz, attemptId) =>
    set((state) => ({
      currentQuiz: quiz,
      currentAttemptId: attemptId,
      currentQuestionIndex: 0,
      answers: new Map(),
      adaptive: initializeAdaptiveState(quiz.difficulty),
      sessionStartTime: Date.now(),
      showExplanation: false,
      error: null,
    })),

  submitAnswer: (questionId, answer, timeSpent, isCorrect) =>
    set((state) => {
      const newAnswers = new Map(state.answers);
      newAnswers.set(questionId, {
        answer,
        timeSpent,
        isCorrect,
      });

      let newAdaptive = state.adaptive;
      if (isCorrect !== undefined) {
        newAdaptive = updateAdaptiveState(state.adaptive, isCorrect);
      }

      return {
        answers: newAnswers,
        selectedAnswers: {
          ...state.selectedAnswers,
          [questionId]: answer,
        },
        adaptive: newAdaptive,
      };
    }),

  nextQuestion: () =>
    set((state) => {
      const currentQuiz = state.currentQuiz;
      if (!currentQuiz) return state;

      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex < currentQuiz.questions.length) {
        return {
          currentQuestionIndex: nextIndex,
          showExplanation: false,
        };
      }
      return state;
    }),

  prevQuestion: () =>
    set((state) => {
      const prevIndex = state.currentQuestionIndex - 1;
      if (prevIndex >= 0) {
        return {
          currentQuestionIndex: prevIndex,
          showExplanation: false,
        };
      }
      return state;
    }),

  setShowExplanation: (show) =>
    set({
      showExplanation: show,
    }),

  // Derived methods
  getCurrentQuestion: () => {
    const state = get();
    if (!state.currentQuiz || state.currentQuestionIndex >= state.currentQuiz.questions.length) {
      return null;
    }
    return state.currentQuiz.questions[state.currentQuestionIndex];
  },

  getProgress: () => {
    const state = get();
    if (!state.currentQuiz) {
      return {
        current: 0,
        total: 0,
        percentage: 0,
      };
    }

    const current = state.currentQuestionIndex + 1;
    const total = state.currentQuiz.questions.length;
    const percentage = (current / total) * 100;

    return {
      current,
      total,
      percentage,
    };
  },

  getTotalTime: () => {
    const state = get();
    if (!state.sessionStartTime) {
      return 0;
    }
    return Math.floor((Date.now() - state.sessionStartTime) / 1000);
  },
}));
