"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DifficultyStars } from "@/components/quiz/difficulty-stars";
import { BookOpen, Users } from "lucide-react";

interface QuizWithAttempts {
  id: string;
  title: string;
  subject: string;
  difficulty: number;
  description?: string;
  _count: {
    questions: number;
    attempts: number;
  };
  creator?: {
    name: string;
    image?: string;
  };
}

interface QuizCardProps {
  quiz: QuizWithAttempts;
  showCreator?: boolean;
}

const SUBJECT_COLORS: Record<string, string> = {
  mathematics: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  science: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  history: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  literature:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  language: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function QuizCard({ quiz, showCreator = false }: QuizCardProps) {
  const subjectColor =
    SUBJECT_COLORS[quiz.subject?.toLowerCase()] || SUBJECT_COLORS.default;

  return (
    <Link href={`/quiz/${quiz.id}`}>
      <Card className="p-5 h-full hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer">
        <div className="space-y-3 h-full flex flex-col">
          {/* Subject Badge */}
          <div className="flex items-center gap-2">
            <Badge className={subjectColor}>{quiz.subject}</Badge>
          </div>

          {/* Title */}
          <h3 className="font-semibold line-clamp-2 text-base flex-1">
            {quiz.title}
          </h3>

          {/* Description if available */}
          {quiz.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {quiz.description}
            </p>
          )}

          {/* Creator info */}
          {showCreator && quiz.creator && (
            <p className="text-xs text-muted-foreground">
              by <span className="font-medium">{quiz.creator.name}</span>
            </p>
          )}

          {/* Difficulty Stars */}
          <div className="flex items-center gap-2">
            <DifficultyStars difficulty={quiz.difficulty} />
            <span className="text-xs text-muted-foreground">
              {quiz.difficulty}/5
            </span>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{quiz._count.questions}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{quiz._count.attempts}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
