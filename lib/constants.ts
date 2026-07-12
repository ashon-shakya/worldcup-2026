export const ALL_STAGES = [
  "Group Stage",
  "Round of 32",
  "Round of 16",
  "Quarter Final",
  "Semi Final",
  "3rd Place",
  "Final"
] as const;

export type TournamentStage = typeof ALL_STAGES[number];

export const KNOCKOUT_STAGES = [
  "Round of 32",
  "Round of 16",
  "Quarter Final",
  "Semi Final",
  "3rd Place",
  "Final"
] as const;

export function isKnockoutStage(stage: string): boolean {
  return KNOCKOUT_STAGES.includes(stage as any);
}

export const DEFAULT_STAGE_MULTIPLIERS: Record<TournamentStage, number> = {
  "Group Stage": 1,
  "Round of 32": 1,
  "Round of 16": 1,
  "Quarter Final": 1,
  "Semi Final": 1,
  "3rd Place": 1,
  "Final": 1
};
