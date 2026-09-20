export type GameMode = 'practice' | 'challenge';

export interface GameModeInfo {
  readonly id: GameMode;
  readonly name: string;
  readonly summary: string;
}

export const GAME_MODES: readonly GameModeInfo[] = [
  {
    id: 'practice',
    name: 'Practice',
    summary: 'No clock, no score. Play until you dry up.',
  },
  {
    id: 'challenge',
    name: 'Challenge',
    summary: 'The clock runs down. Score points and land combos to buy seconds back.',
  },
];

export function isGameMode(value: string): value is GameMode {
  return GAME_MODES.some((mode) => mode.id === value);
}

export function gameModeInfo(mode: GameMode): GameModeInfo {
  const info = GAME_MODES.find((candidate) => candidate.id === mode);
  if (info === undefined) {
    throw new Error(`Unknown game mode: ${mode}`);
  }
  return info;
}
