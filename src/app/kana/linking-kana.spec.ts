import { linkingKana, startingKana } from './linking-kana';

describe('linkingKana', () => {
  const cases: ReadonlyArray<readonly [string, string]> = [
    ['やま', 'ま'],
    ['さくら', 'ら'],
    ['こーひー', 'ひ'],
    ['きんぎょ', 'よ'],
    ['きって', 'て'],
    ['はなぢ', 'じ'],
    ['こづつみ', 'み'],
    ['ぱーてぃー', 'い'],
  ];

  for (const [reading, expected] of cases) {
    it(`links ${reading} on ${expected}`, () => {
      expect(linkingKana(reading)).toBe(expected);
    });
  }

  it('has nothing to link on for an empty reading', () => {
    expect(linkingKana('')).toBe('');
    expect(linkingKana('ー')).toBe('');
  });
});

describe('startingKana', () => {
  it('normalises the first kana the same way', () => {
    expect(startingKana('やま')).toBe('や');
    expect(startingKana('ぢべた')).toBe('じ');
    expect(startingKana('ゃ')).toBe('や');
    expect(startingKana('')).toBe('');
  });

  it('matches the link of the word before it', () => {
    expect(startingKana('よかん')).toBe(linkingKana('きんぎょ'));
    expect(startingKana('ひこうき')).toBe(linkingKana('こーひー'));
  });
});
