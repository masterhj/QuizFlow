import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM d, yyyy");
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

export function getGrade(
  score: number
): { letter: "A" | "B" | "C" | "D" | "F"; color: string; bg: string } {
  if (score >= 90) {
    return { letter: "A", color: "text-green-600", bg: "bg-green-100" };
  } else if (score >= 80) {
    return { letter: "B", color: "text-blue-600", bg: "bg-blue-100" };
  } else if (score >= 70) {
    return { letter: "C", color: "text-yellow-600", bg: "bg-yellow-100" };
  } else if (score >= 60) {
    return { letter: "D", color: "text-orange-600", bg: "bg-orange-100" };
  } else {
    return { letter: "F", color: "text-red-600", bg: "bg-red-100" };
  }
}

export function getDifficultyLabel(
  level: 1 | 2 | 3 | 4 | 5
): "Beginner" | "Easy" | "Medium" | "Hard" | "Expert" {
  switch (level) {
    case 1:
      return "Beginner";
    case 2:
      return "Easy";
    case 3:
      return "Medium";
    case 4:
      return "Hard";
    case 5:
      return "Expert";
    default:
      return "Medium";
  }
}

export function getDifficultyColor(level: number): string {
  switch (level) {
    case 1:
      return "text-green-600";
    case 2:
      return "text-blue-600";
    case 3:
      return "text-yellow-600";
    case 4:
      return "text-orange-600";
    case 5:
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

export function calculateXP(
  score: number,
  totalQuestions: number,
  difficulty: number
): number {
  const baseXP = (score / 100) * 100;
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.2;
  const questionBonus = Math.ceil(totalQuestions / 10) * 10;
  return Math.ceil(baseXP * difficultyMultiplier + questionBonus);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + "...";
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
