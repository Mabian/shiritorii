import { readFileSync } from 'node:fs';

import { linkingKana, startingKana } from '../kana/linking-kana';
import { OPENER_WORDS } from './opener-words';

const words: Readonly<Record<string, unknown>> = JSON.parse(
  readFileSync('public/vocabulary/jmdict-nouns.json', 'utf8'),
).words;

const playable = new Set(Object.keys(words).filter((reading) => !reading.endsWith('ん')));
const continuations = new Set([...playable].map(startingKana));

describe('OPENER_WORDS', () => {
  it('holds no duplicates', () => {
    expect(new Set(OPENER_WORDS).size).toBe(OPENER_WORDS.length);
  });

  for (const opener of OPENER_WORDS) {
    describe(opener, () => {
      it('is in the dictionary', () => {
        expect(Object.hasOwn(words, opener)).toBe(true);
      });

      it('does not end in ん', () => {
        expect(opener.endsWith('ん')).toBe(false);
      });

      it('can be answered', () => {
        expect(continuations.has(linkingKana(opener))).toBe(true);
      });
    });
  }
});
