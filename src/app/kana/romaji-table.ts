// prettier-ignore
const BASIC_KANA: Readonly<Record<string, string>> = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
  ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  sa: 'さ', si: 'し', shi: 'し', su: 'す', se: 'せ', so: 'そ',
  za: 'ざ', zi: 'じ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  ta: 'た', ti: 'ち', chi: 'ち', tu: 'つ', tsu: 'つ', te: 'て', to: 'と',
  da: 'だ', di: 'ぢ', du: 'づ', dzu: 'づ', de: 'で', do: 'ど',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', hu: 'ふ', fu: 'ふ', he: 'へ', ho: 'ほ',
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  ya: 'や', yu: 'ゆ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  wa: 'わ', wo: 'を',
  vu: 'ゔ',
};

// prettier-ignore
const YOUON_STEMS: Readonly<Record<string, string>> = {
  ky: 'き', gy: 'ぎ',
  sy: 'し', sh: 'し',
  zy: 'じ', jy: 'じ', j: 'じ',
  ty: 'ち', ch: 'ち', cy: 'ち',
  dy: 'ぢ',
  ny: 'に', hy: 'ひ', by: 'び', py: 'ぴ', my: 'み', ry: 'り',
};

const YOUON_VOWELS: Readonly<Record<string, string>> = { a: 'ゃ', u: 'ゅ', o: 'ょ', e: 'ぇ' };

// prettier-ignore
const FOREIGN_KANA: Readonly<Record<string, string>> = {
  fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ', fyu: 'ふゅ',
  va: 'ゔぁ', vi: 'ゔぃ', ve: 'ゔぇ', vo: 'ゔぉ',
  tsa: 'つぁ', tsi: 'つぃ', tse: 'つぇ', tso: 'つぉ',
  tha: 'てゃ', thi: 'てぃ', thu: 'てゅ', the: 'てぇ', tho: 'てょ',
  dha: 'でゃ', dhi: 'でぃ', dhu: 'でゅ', dhe: 'でぇ', dho: 'でょ',
  twu: 'とぅ', dwu: 'どぅ',
  wi: 'うぃ', we: 'うぇ',
  ye: 'いぇ',
};

// prettier-ignore
const SMALL_KANA: Readonly<Record<string, string>> = {
  a: 'ぁ', i: 'ぃ', u: 'ぅ', e: 'ぇ', o: 'ぉ',
  ya: 'ゃ', yu: 'ゅ', yo: 'ょ',
  tu: 'っ', tsu: 'っ',
  wa: 'ゎ',
};

// prettier-ignore
const PUNCTUATION: Readonly<Record<string, string>> = {
  '.': '。', ',': '、', '-': 'ー', '?': '？', '!': '！',
  '/': '・', '[': '「', ']': '」', '~': '〜',
};

function buildYouon(): Record<string, string> {
  const youon: Record<string, string> = {};
  for (const [stem, baseKana] of Object.entries(YOUON_STEMS)) {
    for (const [vowel, smallKana] of Object.entries(YOUON_VOWELS)) {
      youon[stem + vowel] = baseKana + smallKana;
    }
  }
  return youon;
}

function buildSmallKana(): Record<string, string> {
  const small: Record<string, string> = {};
  for (const [romaji, kana] of Object.entries(SMALL_KANA)) {
    small[`x${romaji}`] = kana;
    small[`l${romaji}`] = kana;
  }
  return small;
}

export const ROMAJI_TO_KANA: ReadonlyMap<string, string> = new Map(
  Object.entries({
    ...BASIC_KANA,
    ...buildYouon(),
    ...FOREIGN_KANA,
    ...buildSmallKana(),
    ...PUNCTUATION,
  }),
);

/** Longest key in the table — the upper bound for the state machine's longest match. */
export const MAX_ROMAJI_LENGTH = Math.max(...[...ROMAJI_TO_KANA.keys()].map((key) => key.length));

/**
 * Every proper prefix of every key. This lets the state machine decide in O(1) whether a leftover
 * such as `ky` can still grow into a syllable and therefore has to stay pending.
 */
export const ROMAJI_PREFIXES: ReadonlySet<string> = (() => {
  const prefixes = new Set<string>();
  for (const key of ROMAJI_TO_KANA.keys()) {
    for (let length = 1; length < key.length; length += 1) {
      prefixes.add(key.slice(0, length));
    }
  }
  return prefixes;
})();
