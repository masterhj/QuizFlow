import { addDays } from "date-fns";

// SM-2 Algorithm Types
export interface SM2Result {
  newEaseFactor: number;
  newInterval: number;
  nextReviewDate: Date;
}

/**
 * SM-2 Spaced Repetition Algorithm
 * Calculates the next review date and ease factor based on user grade
 * @param easeFactor Current ease factor (default 2.5)
 * @param interval Current interval in days
 * @param grade Quality of response (0-5)
 * @returns New ease factor, interval, and next review date
 */
export function calculateNextReview(
  easeFactor: number,
  interval: number,
  grade: 0 | 1 | 2 | 3 | 4 | 5
): SM2Result {
  let newEaseFactor = easeFactor;
  let newInterval = interval;

  // Calculate new ease factor using SM-2 formula
  newEaseFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

  // Ensure minimum ease factor of 1.3
  newEaseFactor = Math.max(1.3, newEaseFactor);

  // Update interval based on grade
  if (grade < 3) {
    // Failed or poor response - reset to 1 day
    newInterval = 1;
  } else if (grade === 3) {
    // Acceptable - keep interval the same
    newInterval = interval;
  } else if (grade === 4) {
    // Good - use first interval progression
    if (interval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  } else if (grade === 5) {
    // Perfect - use second interval progression
    if (interval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  const nextReviewDate = addDays(new Date(), newInterval);

  return {
    newEaseFactor,
    newInterval,
    nextReviewDate,
  };
}

/**
 * Calculate updated mastery score for a subject
 * Uses weighted average of recent scores with recency bias
 * @param currentMastery Current mastery score (0-100)
 * @param recentScores Last 10 quiz scores for the subject (0-100)
 * @returns New mastery score (0-100)
 */
export function updateMastery(
  currentMastery: number,
  recentScores: number[]
): number {
  if (recentScores.length === 0) {
    return currentMastery;
  }

  // Weight scores with recency bias
  // More recent scores have higher weight
  let weightedSum = 0;
  let totalWeight = 0;

  recentScores.forEach((score, index) => {
    // Weight increases with recency: earlier scores get lower weight
    const weight = (index + 1) / recentScores.length;
    weightedSum += score * weight;
    totalWeight += weight;
  });

  const newMastery = weightedSum / totalWeight;

  // Gradually shift towards new calculated mastery
  // 70% current mastery + 30% new calculated mastery for stability
  const blendedMastery = currentMastery * 0.7 + newMastery * 0.3;

  // Clamp between 0-100
  return Math.max(0, Math.min(100, blendedMastery));
}

/**
 * Adaptive Difficulty Management
 * Determines next difficulty based on performance streaks
 * @param currentDifficulty Current difficulty level (1-5)
 * @param correctStreak Consecutive correct answers
 * @param wrongStreak Consecutive wrong answers
 * @returns Next difficulty level (1-5)
 */
export function getNextDifficulty(
  currentDifficulty: number,
  correctStreak: number,
  wrongStreak: number
): number {
  let nextDifficulty = currentDifficulty;

  if (correctStreak >= 3) {
    // Increase difficulty after 3 correct in a row
    nextDifficulty = Math.min(5, currentDifficulty + 1);
  } else if (wrongStreak >= 2) {
    // Decrease difficulty after 2 wrong in a row
    nextDifficulty = Math.max(1, currentDifficulty - 1);
  }

  // Ensure always between 1-5
  return Math.max(1, Math.min(5, nextDifficulty));
}

/**
 * Calculate weighted score based on question difficulty
 * Harder questions are worth more points
 * @param answers Array of answers with correctness and difficulty
 * @returns Score percentage (0-100)
 */
export function calculateScore(
  answers: Array<{ isCorrect: boolean; difficulty: number }>
): number {
  if (answers.length === 0) return 0;

  // Points per difficulty level
  const difficultyPoints: Record<number, number> = {
    1: 1,
    2: 1.5,
    3: 2,
    4: 2.5,
    5: 3,
  };

  let totalPoints = 0;
  let maxPoints = 0;

  answers.forEach(({ isCorrect, difficulty }) => {
    const points = difficultyPoints[difficulty] || 2;
    maxPoints += points;
    if (isCorrect) {
      totalPoints += points;
    }
  });

  if (maxPoints === 0) return 0;

  // Return as percentage
  return (totalPoints / maxPoints) * 100;
}

/**
 * Calculate XP gained from a quiz attempt
 * Factors in score, difficulty, and streak bonus
 * @param score Quiz score percentage (0-100)
 * @param difficulty Quiz difficulty level (1-5)
 * @param streak Current user streak
 * @returns XP points earned
 */
export function calculateXPGained(
  score: number,
  difficulty: number,
  streak: number
): number {
  // Base XP calculation
  const baseXP = (score / 100) * difficulty * 50;

  // Streak bonus: 5 XP per streak day, capped at 50
  const streakBonus = Math.min(streak * 5, 50);

  // Total XP rounded
  return Math.round(baseXP + streakBonus);
}

/**
 * Adaptive State Management Type
 */
export interface AdaptiveState {
  currentDifficulty: number;
  correctStreak: number;
  wrongStreak: number;
}

/**
 * Update adaptive state based on answer correctness
 * @param state Current adaptive state
 * @param isCorrect Whether the answer was correct
 * @returns Updated adaptive state with new difficulty
 */
export function updateAdaptiveState(
  state: AdaptiveState,
  isCorrect: boolean
): AdaptiveState {
  let newState = { ...state };

  if (isCorrect) {
    newState.correctStreak += 1;
    newState.wrongStreak = 0;
  } else {
    newState.wrongStreak += 1;
    newState.correctStreak = 0;
  }

  // Update difficulty based on streaks
  newState.currentDifficulty = getNextDifficulty(
    newState.currentDifficulty,
    newState.correctStreak,
    newState.wrongStreak
  );

  return newState;
}

/**
 * Initialize adaptive state with starting difficulty
 * @param startingDifficulty Initial difficulty (1-5, default 3)
 * @returns Initial adaptive state
 */
export function initializeAdaptiveState(startingDifficulty: number = 3): AdaptiveState {
  return {
    currentDifficulty: Math.max(1, Math.min(5, startingDifficulty)),
    correctStreak: 0,
    wrongStreak: 0,
  };
}

/**
 * Get mastery level label based on score
 * @param mastery Mastery percentage (0-100)
 * @returns Label: "Novice" | "Beginner" | "Intermediate" | "Advanced" | "Expert"
 */
export function getMasteryLabel(
  mastery: number
): "Novice" | "Beginner" | "Intermediate" | "Advanced" | "Expert" {
  if (mastery < 20) return "Novice";
  if (mastery < 40) return "Beginner";
  if (mastery < 60) return "Intermediate";
  if (mastery < 80) return "Advanced";
  return "Expert";
}

/**
 * Get color for mastery level visualization
 * @param mastery Mastery percentage (0-100)
 * @returns Tailwind color class
 */
export function getMasteryColor(mastery: number): string {
  if (mastery < 20) return "text-red-600";
  if (mastery < 40) return "text-orange-600";
  if (mastery < 60) return "text-yellow-600";
  if (mastery < 80) return "text-blue-600";
  return "text-green-600";
}

/**
 * Calculate days until next review
 * @param nextReviewDate Next review date
 * @returns Number of days until review
 */
export function getDaysUntilReview(nextReviewDate: Date): number {
  const now = new Date();
  const diffTime = nextReviewDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
