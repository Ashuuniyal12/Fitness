/**
 * Epley Formula: 1RM = Weight * (1 + 0.0333 * Reps)
 */
export function calculateEpley1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + 0.0333 * reps));
}

/**
 * Brzycki Formula: 1RM = Weight * (36 / (37 - Reps))
 */
export function calculateBrzycki1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps >= 37) return weight; // Formula breaks down at high reps
  return Math.round(weight * (36 / (37 - reps)));
}

/**
 * Calculate total volume: Volume = Sets * Reps * Weight
 * Used per set here.
 */
export function calculateSetVolume(weight: number, reps: number): number {
  return weight * reps;
}
