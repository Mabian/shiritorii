import { GAME_MODES, gameModeInfo, isGameMode } from './game-mode';

describe('game modes', () => {
  it('offers practice and challenge', () => {
    expect(GAME_MODES.map((mode) => mode.id)).toEqual(['practice', 'challenge']);
  });

  it('recognises the known modes', () => {
    expect(isGameMode('practice')).toBe(true);
    expect(isGameMode('challenge')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isGameMode('banana')).toBe(false);
    expect(isGameMode('')).toBe(false);
    expect(isGameMode('Practice')).toBe(false);
  });

  it('describes a mode', () => {
    expect(gameModeInfo('practice').name).toBe('Practice');
    expect(gameModeInfo('challenge').name).toBe('Challenge');
  });

  it('gives every mode a name and a summary', () => {
    for (const mode of GAME_MODES) {
      expect(mode.name).not.toBe('');
      expect(mode.summary).not.toBe('');
    }
  });
});
