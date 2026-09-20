import { readFileSync } from 'node:fs';

import { VocabularyEntry } from './vocabulary-entry';

const words: Readonly<Record<string, readonly VocabularyEntry[]>> = JSON.parse(
  readFileSync('public/vocabulary/jmdict-nouns.json', 'utf8'),
).words;

describe('the shipped vocabulary', () => {
  it('reaches well past the common words', () => {
    const readings = Object.keys(words);
    const uncommon = readings.filter(
      (reading) => !words[reading].some((entry) => entry.common === true),
    );

    expect(readings.length).toBeGreaterThan(150_000);
    expect(uncommon.length).toBeGreaterThan(100_000);
  });

  it('holds everyday words the common subset was turning away', () => {
    expect(words['しおり']?.[0]?.meaning).toContain('bookmark');
  });

  it('still holds the common ones', () => {
    expect(words['かえり']?.[0]?.meaning).toContain('return');
    expect(words['さくら']?.[0]?.kanji).toBe('桜');
  });

  it('marks the common words so the opponent can keep to them', () => {
    // Which words carry the marker is EDRDG's call and can shift between releases, so only the
    // marker itself is asserted here, not any particular word's classification.
    expect(words['さくら']?.[0]?.common).toBe(true);
  });

  it('puts the useful reading first where a reading has several', () => {
    expect(words['みず']?.[0]?.meaning).toContain('water');
  });

  it('leaves the tags off entries that carry none', () => {
    expect(words['さくら']?.[0]?.tags).toBeUndefined();
    expect(words['しゃぶしゃぶ']?.some((entry) => entry.tags !== undefined)).toBe(true);
  });
});
