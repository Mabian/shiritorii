import { linkingKana, startingKana } from '../kana/linking-kana';
import { flushPending, toHiragana, toKana } from '../kana/to-kana';
import { LookupReading, VocabularyEntry } from './vocabulary-entry';

export type WordCheck =
  | { readonly status: 'empty' }
  /** Still holds romaji that has not become kana */
  | { readonly status: 'incomplete' }
  | { readonly status: 'ends-with-n'; readonly reading: string }
  | { readonly status: 'unknown'; readonly reading: string }
  | { readonly status: 'wrong-start'; readonly reading: string; readonly expected: string }
  | { readonly status: 'already-used'; readonly reading: string }
  | {
      readonly status: 'ok';
      readonly reading: string;
      readonly entries: readonly VocabularyEntry[];
    };

const KANA_ONLY = /^[ぁ-ゖァ-ヶー]+$/;

/** What the answer has to connect to. */
export interface Chain {
  readonly previous: string;
  readonly used: ReadonlySet<string>;
}

/**
 * Checks a word against the vocabulary, plus the shiritori rules that need no game state.
 *
 * Whether the word is a noun is not checked here: the vocabulary only contains nouns, so anything
 * else is simply unknown.
 */
export function checkWord(input: string, lookup: LookupReading, chain: Chain): WordCheck {
  const converted = toKana(input.trim());
  if (converted.kana === '' && converted.pending === '') {
    return { status: 'empty' };
  }

  // A trailing `n` is the one leftover that still resolves on its own, to ん.
  const reading = toHiragana(flushPending(converted));
  if (!KANA_ONLY.test(reading)) {
    return { status: 'incomplete' };
  }

  if (reading.endsWith('ん')) {
    return { status: 'ends-with-n', reading };
  }

  const entries = lookup(reading);
  if (entries === undefined || entries.length === 0) {
    return { status: 'unknown', reading };
  }

  // The dictionary comes first on purpose: gibberish should be called gibberish, not blamed on the
  // chain.
  const expected = linkingKana(chain.previous);
  if (startingKana(reading) !== expected) {
    return { status: 'wrong-start', reading, expected };
  }

  if (chain.used.has(reading)) {
    return { status: 'already-used', reading };
  }

  return { status: 'ok', reading, entries };
}
