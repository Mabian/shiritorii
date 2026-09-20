import { chooseWord } from './opponent';

/** Hands out the given fractions in order, so every draw is predictable. */
function fixedRandom(...values: readonly number[]) {
  let index = 0;
  return () => values[index++ % values.length];
}

describe('chooseWord', () => {
  const candidates = ['もり', 'もち', 'もも'];

  it('draws from the candidates', () => {
    expect(chooseWord(candidates, new Set(), fixedRandom(0))).toBe('もり');
    expect(chooseWord(candidates, new Set(), fixedRandom(0.5))).toBe('もち');
    expect(chooseWord(candidates, new Set(), fixedRandom(0.999))).toBe('もも');
  });

  it('skips what has already been played', () => {
    expect(chooseWord(candidates, new Set(['もり', 'もち']), fixedRandom(0))).toBe('もも');
  });

  it('gives up when nothing is left', () => {
    expect(chooseWord(candidates, new Set(candidates), fixedRandom(0))).toBeUndefined();
    expect(chooseWord([], new Set(), fixedRandom(0))).toBeUndefined();
  });
});
