/** One dictionary meaning of a reading, as shipped in public/vocabulary/. */
export interface VocabularyEntry {
  /** Kanji spelling; absent for words that are only ever written in kana */
  readonly kanji?: string;
  /** Original kana spelling where it differs from the reading, i.e. katakana words */
  readonly kana?: string;
  /** Short English gloss */
  readonly meaning: string;
  /** JMdict sense tags such as `on-mim` or `food` */
  readonly tags: readonly string[];
}

export type LookupReading = (reading: string) => readonly VocabularyEntry[] | undefined;
