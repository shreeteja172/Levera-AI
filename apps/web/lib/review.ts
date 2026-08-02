export const REVIEW_INTERVALS = {
  again: 1,
  hard: 2,
  good: 5,
  easy: 10,
} as const;

export type ReviewRating = keyof typeof REVIEW_INTERVALS;

export function todayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function tomorrowStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getReviewDayDifference(
  nextReviewAt: Date | string | null,
): number {
  if (!nextReviewAt) return 0;
  const reviewDate = new Date(nextReviewAt);
  reviewDate.setHours(0, 0, 0, 0);
  const diffTime = reviewDate.getTime() - todayStart().getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function isDue(nextReviewAt: Date | string | null): boolean {
  return getReviewDayDifference(nextReviewAt) <= 0;
}

export function isTomorrow(nextReviewAt: Date | string | null): boolean {
  return getReviewDayDifference(nextReviewAt) === 1;
}
