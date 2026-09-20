import { Injectable, computed, resource } from '@angular/core';

import { VocabularyEntry } from './vocabulary-entry';

const VOCABULARY_URL = 'vocabulary/jmdict-common-nouns.json';

/** The shape written by scripts/build-vocabulary.mjs. */
interface VocabularyFile {
  /** Every JMdict tag code mapped to its English description. */
  readonly tagDescriptions: Readonly<Record<string, string>>;
  /** Entries keyed by their hiragana reading. */
  readonly words: Readonly<Record<string, readonly VocabularyEntry[]>>;
}

interface Indexed {
  readonly words: ReadonlyMap<string, readonly VocabularyEntry[]>;
  readonly tagDescriptions: ReadonlyMap<string, string>;
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

  /** The human-readable text behind a tag code, falling back to the code itself. */
  describeTag(tag: string): string {
    return this.data.value()?.tagDescriptions.get(tag) ?? tag;
  }
}

/** Maps beat plain objects here, because `noPropertyAccessFromIndexSignature` is on. */
function index(file: VocabularyFile): Indexed {
  return {
    words: new Map(Object.entries(file.words)),
    tagDescriptions: new Map(Object.entries(file.tagDescriptions)),
  };
}
