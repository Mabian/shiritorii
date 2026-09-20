import { MAX_ROMAJI_LENGTH, ROMAJI_PREFIXES, ROMAJI_TO_KANA } from './romaji-table';

export interface KanaResult {
  readonly kana: string;
  readonly pending: string;
}

const VOWELS = new Set(['a', 'i', 'u', 'e', 'o']);
const HIRAGANA_FIRST = 0x3041;
const HIRAGANA_LAST = 0x3096;
const KATAKANA_OFFSET = 0x60;

export function toKatakana(kana: string): string {
  let katakana = '';
  for (const char of kana) {
    const code = char.codePointAt(0) ?? 0;
    katakana +=
      code >= HIRAGANA_FIRST && code <= HIRAGANA_LAST
        ? String.fromCodePoint(code + KATAKANA_OFFSET)
        : char;
  }
  return katakana;
}

export function toKana(input: string): KanaResult {
  const lower = input.toLowerCase();
  let kana = '';
  let index = 0;

  while (index < lower.length) {
    const char = charAt(lower, index);
    const next = charAt(lower, index + 1);

    // Not romaji (already kana, whitespace, a digit): pass through untouched.
    if (!isRomajiChar(char)) {
      kana += input[index];
      index += 1;
      continue;
    }

    // The ん rule.
    if (char === 'n') {
      if (next === 'n' || next === "'") {
        kana += applyCase('ん', input.slice(index, index + 2));
        index += 2;
        continue;
      }
      if (next === '') {
        // A lone trailing `n` can still grow into な, にゃ … and therefore stays pending.
        break;
      }
      if (!VOWELS.has(next) && next !== 'y') {
        kana += applyCase('ん', input[index]);
        index += 1;
        continue;
      }
    }

    // Sokuon: a doubled consonant, plus `tch` as a special case.
    if (isConsonant(char) && (next === char || (char === 't' && next === 'c'))) {
      kana += applyCase('っ', input[index]);
      index += 1;
      continue;
    }

    // Longest match in the table.
    const match = findLongestMatch(lower, index);
    if (match !== undefined) {
      kana += applyCase(match.kana, input.slice(index, index + match.length));
      index += match.length;
      continue;
    }

    // The leftover can still grow into a syllable: leave it pending.
    if (ROMAJI_PREFIXES.has(lower.slice(index))) {
      break;
    }

    // Dead end (a typo such as `kyz`): take the character literally and keep going.
    kana += input[index];
    index += 1;
  }

  return { kana, pending: input.slice(index) };
}

/**
 * Finalises an input, for instance when a word is submitted: a pending `n` becomes ん, everything
 * else is left as it is.
 */
export function flushPending(result: KanaResult): string {
  if (result.pending.toLowerCase() !== 'n') {
    return result.kana + result.pending;
  }
  return result.kana + (result.pending === 'N' ? 'ン' : 'ん');
}

function findLongestMatch(
  lower: string,
  index: number,
): { readonly kana: string; readonly length: number } | undefined {
  const maxLength = Math.min(MAX_ROMAJI_LENGTH, lower.length - index);
  for (let length = maxLength; length >= 1; length -= 1) {
    const kana = ROMAJI_TO_KANA.get(lower.slice(index, index + length));
    if (kana !== undefined) {
      return { kana, length };
    }
  }
  return undefined;
}

function charAt(text: string, index: number): string {
  return index < text.length ? text[index] : '';
}

function isRomajiChar(char: string): boolean {
  return /[a-z']/.test(char) || ROMAJI_TO_KANA.has(char);
}

function isConsonant(char: string): boolean {
  return /[a-z]/.test(char) && char !== 'n' && !VOWELS.has(char);
}

/** Romaji written entirely in uppercase produces katakana. */
function applyCase(kana: string, romajiSegment: string): string {
  const letters = romajiSegment.replace(/[^a-zA-Z]/g, '');
  return letters.length > 0 && letters === letters.toUpperCase() ? toKatakana(kana) : kana;
}
