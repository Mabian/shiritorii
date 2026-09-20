import { Injectable, computed, resource } from '@angular/core';

import { startingKana } from '../kana/linking-kana';
import { VocabularyEntry } from './vocabulary-entry';

const VOCABULARY_URL = 'vocabulary/jmdict-nouns.json';

/** The shape written by scripts/build-vocabulary.mjs. */
interface VocabularyFile {
  /** Entries keyed by their hiragana reading. */
  readonly words: Readonly<Record<string, readonly VocabularyEntry[]>>;
}

interface Indexed {
  readonly words: ReadonlyMap<string, readonly VocabularyEntry[]>;
  /** Common playable readings bucketed by their starting kana; the opponent draws from these. */
  readonly byStartingKana: ReadonlyMap<string, readonly string[]>;
}

@Injectable({ providedIn: 'root' })
export class Vocabulary {
  private readonly data = resource({
    loader: async ({ abortSignal }) => {
      const response = await fetch(VOCABULARY_URL, { signal: abortSignal });
      if (!response.ok) {
        throw new Error(`Could not load the vocabulary: ${response.status}`);
      }
      return index((await response.json()) as VocabularyFile);
    },
  });

  readonly isLoading = computed(() => this.data.isLoading());
  readonly hasFailed = computed(() => this.data.error() !== undefined);
  readonly isReady = computed(() => this.data.hasValue());

  lookup(reading: string): readonly VocabularyEntry[] | undefined {
    return this.data.value()?.words.get(reading);
  }

  /** Common readings starting with this kana that do not end in ん, so they can be answered. */
  wordsStartingWith(kana: string): readonly string[] {
    return this.data.value()?.byStartingKana.get(kana) ?? [];
  }
}

/** Maps beat plain objects here, because `noPropertyAccessFromIndexSignature` is on. */
function index(file: VocabularyFile): Indexed {
  const words = new Map(Object.entries(file.words));
  const byStartingKana = new Map<string, string[]>();

  for (const [reading, entries] of words) {
    // A word ending in ん loses the game, so the opponent must never be able to draw one. Obscure
    // words are fair game for the player but would make a baffling opponent, so they stay out too
    if (reading.endsWith('ん') || !entries.some((entry) => entry.common === true)) {
      continue;
    }
    const start = startingKana(reading);
    const bucket = byStartingKana.get(start);
    if (bucket === undefined) {
      byStartingKana.set(start, [reading]);
    } else {
      bucket.push(reading);
    }
  }

  return { words, byStartingKana };
}
