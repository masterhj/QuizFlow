// Re-exports from Prisma
export { UserRole as Role, QuestionType } from "@prisma/client";
export type { User, Quiz, Question, Attempt, AttemptAnswer, TopicMastery, Review } from "@prisma/client";

// Quiz Types
export type QuizWithQuestions = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  difficulty: number;
  isPublished: boolean;
  creatorId: string;
  tags: string[];
  estimatedMinutes: number;
  createdAt: Date;
  updatedAt: Date;
  questions: Question[];
  creator: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

export type QuizWithAttempts = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  difficulty: number;
  isPublished: boolean;
  creatorId: string;
  tags: string[];
  estimatedMinutes: number;
  createdAt: Date;
  updatedAt: Date;
  attempts: Attempt[];
  _count: {
    attempts: number;
  };
};

// Attempt Types
export type AttemptWithAnswers = {
  id: string;
  userId: string;
  quizId: string;
  startedAt: Date;
  completedAt: Date | null;
  score: number | null;
  totalQuestions: number;
  correctCount: number;
  timeTakenSeconds: number | null;
  answers: AttemptAnswer[];
  quiz: Quiz;
};

// Question Types
export type MCQOption = {
  id: string;
  text: string;
};

export type QuestionWithOptions = {
  id: string;
  quizId: string;
  text: string;
  type: import("@prisma/client").QuestionType;
  options: MCQOption[] | null;
  correctAnswer: string;
  difficulty: number;
  explanation: string | null;
  order: number;
  createdAt: Date;
};

// Session & Auth Types
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: import("@prisma/client").UserRole;
  image?: string;
  xp: number;
  streak: number;
};

// API Response Types
export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  meta?: Record<string, unknown>;
};

export type PaginatedResponse<T> = ApiResponse<T> & {
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

// Store Types
export type QuizStoreState = {
  currentQuiz: QuizWithQuestions | null;
  currentAttempt: AttemptWithAnswers | null;
  selectedAnswers: Record<string, string>;
  isLoading: boolean;
  error: string | null;
};

export type QuizStoreActions = {
  setCurrentQuiz: (quiz: QuizWithQuestions | null) => void;
  setCurrentAttempt: (attempt: AttemptWithAnswers | null) => void;
  selectAnswer: (questionId: string, answer: string) => void;
  clearAnswers: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

export type UserStoreState = {
  user: SessionUser | null;
  isLoading: boolean;
  error: string | null;
  xp: number;
  streak: number;
  masteries: Map<string, number>; // subject -> mastery score
};

export type UserStoreActions = {
  setUser: (user: SessionUser | null) => void;
  updateXP: (amount: number) => void;
  updateStreak: (amount: number) => void;
  setMastery: (subject: string, score: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

// Analytics Types
export type AnalyticsData = {
  date: string;
  score: number;
  quizzesTaken: number;
}[];

export type TopicMasteryData = {
  subject: string;
  mastery: number;
  nextReview: Date;
};

// Review Types
export type ReviewSession = {
  questionId: string;
  question: string;
  correctAnswer: string;
  userGrade: 0 | 1 | 2 | 3 | 4 | 5 | null;
};

// Form Input Types (to be imported from validations)
export type CreateQuizInput = {
  title: string;
  subject: string;
  description?: string;
  difficulty: number;
  tags: string[];
  estimatedMinutes: number;
};

export type UpdateQuizInput = Partial<CreateQuizInput> & {
  isPublished?: boolean;
};

export type CreateQuestionInput = {
  text: string;
  type: import("@prisma/client").QuestionType;
  options?: MCQOption[] | null;
  correctAnswer: string;
  difficulty: number;
  explanation?: string;
  order?: number;
};

// Adaptive Learning Types
export type AdaptiveState = {
  currentDifficulty: number;
  correctStreak: number;
  wrongStreak: number;
};

// Leaderboard Types
export type LeaderboardEntry = {
  userId: string;
  name: string;
  image: string | null;
  xp: number;
  quizzesTaken: number;
  averageScore: number;
  rank: number;
};

// Quiz Statistics Types
export type QuizStatistics = {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageTime: number;
  completionRate: number;
};

// Difficulty Progression Types
export type DifficultyProgression = {
  easy: number;
  medium: number;
  hard: number;
  expert: number;
};
