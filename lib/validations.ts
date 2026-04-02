import { z } from "zod";
import { UserRole, QuestionType } from "@prisma/client";

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum([UserRole.STUDENT, UserRole.TEACHER], {
      errorMap: () => ({ message: "Invalid role" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Quiz Schemas
export const createQuizSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
  difficulty: z.number().int().min(1).max(5, "Difficulty must be between 1 and 5"),
  tags: z
    .array(z.string())
    .max(10, "Maximum 10 tags allowed")
    .default([]),
  estimatedMinutes: z
    .number()
    .int()
    .positive("Estimated minutes must be positive")
    .default(10),
});

export const updateQuizSchema = createQuizSchema.partial();

export const quizValidationSchema = createQuizSchema;

export const publishQuizSchema = z.object({
  isPublished: z.boolean(),
});

// Question Schemas
const mcqOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Option text is required"),
});

export const createQuestionSchema = z
  .object({
    text: z.string().min(5, "Question text must be at least 5 characters"),
    type: z.enum([QuestionType.MCQ, QuestionType.SHORT_ANSWER], {
      errorMap: () => ({ message: "Invalid question type" }),
    }),
    options: z
      .array(mcqOptionSchema)
      .min(4, "MCQ must have exactly 4 options")
      .max(4, "MCQ must have exactly 4 options")
      .optional(),
    correctAnswer: z.string().min(1, "Correct answer is required"),
    difficulty: z
      .number()
      .int()
      .min(1, "Difficulty must be between 1 and 5")
      .max(5, "Difficulty must be between 1 and 5"),
    explanation: z
      .string()
      .max(1000, "Explanation must be at most 1000 characters")
      .optional(),
    order: z.number().int().nonnegative().default(0),
  })
  .refine(
    (data) => {
      if (data.type === QuestionType.MCQ) {
        return data.options && data.options.length === 4;
      }
      return true;
    },
    {
      message: "MCQ questions must have exactly 4 options",
      path: ["options"],
    }
  );

// Attempt Schemas
export const submitAnswerSchema = z.object({
  questionId: z.string().cuid("Invalid question ID"),
  userAnswer: z.string().min(1, "Answer is required"),
  timeSpentSeconds: z.number().int().nonnegative().default(0),
});

export const completeAttemptSchema = z.object({
  attemptId: z.string().cuid("Invalid attempt ID"),
  answers: z.array(submitAnswerSchema).min(1, "At least one answer is required"),
});

// AI Generation Schema
export const generateQuestionsSchema = z.object({
  content: z
    .string()
    .min(50, "Content must be at least 50 characters")
    .max(5000, "Content must be at most 5000 characters"),
  subject: z.string().min(1, "Subject is required"),
  count: z
    .number()
    .int()
    .min(1, "Must generate at least 1 question")
    .max(20, "Cannot generate more than 20 questions")
    .default(10),
  difficulty: z
    .number()
    .int()
    .min(1, "Difficulty must be between 1 and 5")
    .max(5, "Difficulty must be between 1 and 5")
    .default(3),
});

// Review Schema
export const reviewGradeSchema = z.object({
  reviewId: z.string().cuid("Invalid review ID"),
  grade: z
    .number()
    .int()
    .min(0, "Grade must be between 0 and 5")
    .max(5, "Grade must be between 0 and 5"),
});

// Profile Schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  bio: z
    .string()
    .max(200, "Bio must be at most 200 characters")
    .optional(),
  image: z.string().url("Invalid image URL").optional(),
});

// Pagination Schema
export const paginationSchema = z.object({
  page: z.number().int().positive("Page must be positive").default(1),
  pageSize: z
    .number()
    .int()
    .positive("Page size must be positive")
    .max(50, "Page size cannot exceed 50")
    .default(10),
});

// Search and Filter Schema
export const searchQuizzesSchema = paginationSchema.extend({
  query: z.string().optional(),
  subject: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  sortBy: z.enum(["createdAt", "title", "difficulty"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const searchUsersSchema = paginationSchema.extend({
  query: z.string().optional(),
  sortBy: z.enum(["xp", "name", "createdAt"]).default("xp"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// Inferred Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type PublishQuizInput = z.infer<typeof publishQuizSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type CompleteAttemptInput = z.infer<typeof completeAttemptSchema>;
export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;
export type ReviewGradeInput = z.infer<typeof reviewGradeSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchQuizzesInput = z.infer<typeof searchQuizzesSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
