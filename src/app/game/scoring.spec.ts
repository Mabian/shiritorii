import { SCORING, awardForCorrect, comboMultiplier } from './scoring';

describe('comboMultiplier', () => {
  it('stays flat until two answers in a row', () => {
    expect(comboMultiplier(0)).toBe(1);
    expect(comboMultiplier(1)).toBe(1);
  });

  it('grows by a whole step per further answer', () => {
    expect(comboMultiplier(2)).toBe(2);
    expect(comboMultiplier(3)).toBe(3);
    expect(comboMultiplier(4)).toBe(4);
    expect(comboMultiplier(8)).toBe(8);
  });

  it('never returns a fraction', () => {
    for (let streak = 0; streak < 30; streak += 1) {
      expect(Number.isInteger(comboMultiplier(streak))).toBe(true);
    }
  });
});

describe('awardForCorrect', () => {
  it('pays the base points on a first answer with room on the clock', () => {
    expect(awardForCorrect(1, 20)).toEqual({
      points: 10,
      multiplier: 1,
      secondsGained: 5,
      wastedSeconds: 0,
    });
  });

  it('multiplies the base points with the combo', () => {
    expect(awardForCorrect(3, 20).points).toBe(30);
  });

  it('pays whole points even though the clock runs on fractions', () => {
    for (const secondsLeft of [36.7183, 38.00001, 39.9999, 35.5, 12.345]) {
      expect(Number.isInteger(awardForCorrect(4, secondsLeft).points)).toBe(true);
    }
  });

  it('turns the seconds that no longer fit into points', () => {
    expect(awardForCorrect(1, 38)).toEqual({
      points: 10 + 3 * SCORING.pointsPerWastedSecond,
      multiplier: 1,
      secondsGained: 2,
      wastedSeconds: 3,
    });
  });

  it('pays the whole refill out as points on a full clock', () => {
    const award = awardForCorrect(1, SCORING.maxSeconds);

    expect(award.secondsGained).toBe(0);
    expect(award.wastedSeconds).toBe(SCORING.secondsPerWord);
    expect(award.points).toBe(10 + 5 * SCORING.pointsPerWastedSecond);
  });

  it('keeps the overflow bonus out of the combo', () => {
    const plain = awardForCorrect(1, SCORING.maxSeconds);
    const combo = awardForCorrect(3, SCORING.maxSeconds);

    expect(combo.points - plain.points).toBe(SCORING.basePoints * 2);
  });
});
