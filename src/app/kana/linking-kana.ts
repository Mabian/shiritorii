/**
 * Shiritori links words on a single kana, but the last character of a reading is not always that
 * kana: ー and っ carry no sound of their own, small kana link on their large form, and ぢ/づ link
 * on じ/ず because no modern word starts with them.
 *
 * Without this, eight endings would have no continuation at all in the vocabulary.
 */

const LARGE_FORM: ReadonlyMap<string, string> = new Map(
  Object.entries({
    ぁ: 'あ',
    ぃ: 'い',
    ぅ: 'う',
    ぇ: 'え',
    ぉ: 'お',
    ゃ: 'や',
    ゅ: 'ゆ',
    ょ: 'よ',
    ゎ: 'わ',
  }),
);

const UNVOICED_FORM: ReadonlyMap<string, string> = new Map(Object.entries({ ぢ: 'じ', づ: 'ず' }));

/** Characters that carry no kana of their own and are skipped when looking for the link. */
const SILENT = new Set(['ー', 'っ']);

/** The kana the next word has to start with. */
export function linkingKana(reading: string): string {
  for (let index = reading.length - 1; index >= 0; index -= 1) {
    const char = reading[index];
    if (!SILENT.has(char)) {
      return normalise(char);
    }
  }
  return '';
}

/** The kana a word effectively starts with, normalised the same way so both sides compare. */
export function startingKana(reading: string): string {
  return reading === '' ? '' : normalise(reading[0]);
}

function normalise(kana: string): string {
  const large = LARGE_FORM.get(kana) ?? kana;
  return UNVOICED_FORM.get(large) ?? large;
}
