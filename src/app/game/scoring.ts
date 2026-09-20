export const SCORING = {
  startingSeconds: 30,
  maxSeconds: 40,
  secondsPerWord: 5,
  basePoints: 10,
  wrongAnswerPoints: -5,
  comboStartsAtStreak: 2,
  comboStep: 1,
  pointsPerWastedSecond: 3,
  skipCost: 10,
} as const;

export interface Award {
  readonly points: number;
  readonly multiplier: number;
  readonly secondsGained: number;
  readonly wastedSeconds: number;
}

/** 1 until two in a row, then 2, 3, 4 … without a ceiling. */
export function comboMultiplier(streak: number): number {
  if (streak < SCORING.comboStartsAtStreak) {
    return 1;
  }
  return 1 + SCORING.comboStep * (streak - 1);
}

/**
 * Seconds that no longer fit under the ceiling are paid out as points instead, so answering on a full
 * clock is worth the most. That bonus deliberately skips the combo, or it would dwarf everything.
 */
export function awardForCorrect(streak: number, secondsLeft: number): Award {
  const secondsGained = Math.max(
    0,
    Math.min(SCORING.secondsPerWord, SCORING.maxSeconds - secondsLeft),
  );
  const wastedSeconds = SCORING.secondsPerWord - secondsGained;
  const multiplier = comboMultiplier(streak);

  return {
    multiplier,
    secondsGained,
    wastedSeconds,
    // The clock runs on fractions, so the wasted seconds do too. Rounded once at the end, because
    // a score of 586.1180999999642 is not a score.
    points: Math.round(
      SCORING.basePoints * multiplier + wastedSeconds * SCORING.pointsPerWastedSecond,
    ),
  };
}
