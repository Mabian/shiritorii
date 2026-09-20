import { flushPending, toHiragana, toKana, toKatakana } from './to-kana';

function kanaOf(input: string): string {
  const { kana, pending } = toKana(input);
  expect(pending).toBe('');
  return kana;
}

describe('toKana', () => {
  describe('base syllables', () => {
    const cases: ReadonlyArray<readonly [string, string]> = [
      ['a', 'あ'],
      ['ka', 'か'],
      ['sakura', 'さくら'],
      ['shi', 'し'],
      ['si', 'し'],
      ['chi', 'ち'],
      ['ti', 'ち'],
      ['tsu', 'つ'],
      ['tu', 'つ'],
      ['fu', 'ふ'],
      ['hu', 'ふ'],
      ['ji', 'じ'],
      ['zi', 'じ'],
      ['du', 'づ'],
      ['di', 'ぢ'],
      ['wo', 'を'],
    ];

    for (const [romaji, expected] of cases) {
      it(`converts ${romaji} to ${expected}`, () => {
        expect(kanaOf(romaji)).toBe(expected);
      });
    }
  });

  describe('youon', () => {
    const cases: ReadonlyArray<readonly [string, string]> = [
      ['kya', 'きゃ'],
      ['kyu', 'きゅ'],
      ['kyo', 'きょ'],
      ['sha', 'しゃ'],
      ['sya', 'しゃ'],
      ['cha', 'ちゃ'],
      ['ja', 'じゃ'],
      ['jya', 'じゃ'],
      ['ryo', 'りょ'],
      ['she', 'しぇ'],
    ];

    for (const [romaji, expected] of cases) {
      it(`converts ${romaji} to ${expected}`, () => {
        expect(kanaOf(romaji)).toBe(expected);
      });
    }

    it('keeps ky pending until the vowel arrives', () => {
      expect(toKana('k')).toEqual({ kana: '', pending: 'k' });
      expect(toKana('ky')).toEqual({ kana: '', pending: 'ky' });
      expect(toKana('kya')).toEqual({ kana: 'きゃ', pending: '' });
    });
  });

  describe('sokuon', () => {
    it('turns doubled consonants into っ', () => {
      expect(kanaOf('kitte')).toBe('きって');
      expect(kanaOf('yappari')).toBe('やっぱり');
      expect(kanaOf('zasshi')).toBe('ざっし');
    });

    it('treats tch as っち', () => {
      expect(kanaOf('matchi')).toBe('まっち');
    });

    it('never doubles n', () => {
      expect(kanaOf('onna')).toBe('おんあ');
      expect(kanaOf('onnna')).toBe('おんな');
    });
  });

  describe('the ん rule', () => {
    it('converts nn and n-apostrophe to ん', () => {
      expect(kanaOf('nn')).toBe('ん');
      expect(kanaOf("n'")).toBe('ん');
      expect(kanaOf("hon'ya")).toBe('ほんや');
    });

    it('forms a syllable when a vowel or y follows', () => {
      expect(kanaOf('na')).toBe('な');
      expect(kanaOf('nya')).toBe('にゃ');
      expect(kanaOf('konnnichiwa')).toBe('こんにちわ');
    });

    it('always consumes nn as ん, the way Japanese IMEs do', () => {
      // こんにちわ therefore needs three n: the second pair is already spent.
      expect(kanaOf('konnichiwa')).toBe('こんいちわ');
    });

    it('converts n before a consonant to ん', () => {
      expect(kanaOf('ganbaru')).toBe('がんばる');
      expect(kanaOf('senpai')).toBe('せんぱい');
    });

    it('keeps a trailing n pending', () => {
      expect(toKana('shinbun')).toEqual({ kana: 'しんぶ', pending: 'n' });
    });
  });

  describe('small kana and punctuation', () => {
    it('produces small kana through x and l', () => {
      expect(kanaOf('xtsu')).toBe('っ');
      expect(kanaOf('ltu')).toBe('っ');
      expect(kanaOf('xya')).toBe('ゃ');
      expect(kanaOf('xa')).toBe('ぁ');
    });

    it('converts punctuation', () => {
      expect(kanaOf('.')).toBe('。');
      expect(kanaOf(',')).toBe('、');
      expect(kanaOf('-')).toBe('ー');
    });
  });

  describe('katakana through uppercase', () => {
    it('converts fully uppercase romaji to katakana', () => {
      expect(kanaOf('KYA')).toBe('キャ');
      expect(kanaOf('RAMENN')).toBe('ラメン');
      expect(kanaOf('KITTE')).toBe('キッテ');
      expect(kanaOf('NN')).toBe('ン');
    });

    it('leaves mixed case on hiragana', () => {
      expect(kanaOf('Kya')).toBe('きゃ');
    });
  });

  describe('robustness', () => {
    it('passes existing kana and foreign characters through', () => {
      expect(kanaOf('きゃku')).toBe('きゃく');
      expect(kanaOf('あ ka')).toBe('あ か');
    });

    it('does not get stuck on a dead end', () => {
      expect(toKana('kyz')).toEqual({ kana: 'ky', pending: 'z' });
    });

    it('is idempotent', () => {
      for (const input of ['kya', 'shinbun', 'kitte', 'きゃku', 'KYA', 'xtsu']) {
        const once = toKana(input).kana;
        expect(toKana(once).kana).toBe(once);
      }
    });
  });
});

describe('flushPending', () => {
  it('finalises a pending n as ん', () => {
    expect(flushPending(toKana('shinbun'))).toBe('しんぶん');
    expect(flushPending(toKana('SHINBUN'))).toBe('シンブン');
  });

  it('leaves any other pending leftover alone', () => {
    expect(flushPending(toKana('kyk'))).toBe('kyk');
  });
});

describe('toKatakana', () => {
  it('shifts the hiragana block only', () => {
    expect(toKatakana('きゃっ')).toBe('キャッ');
    expect(toKatakana('ー。a')).toBe('ー。a');
  });
});

describe('toHiragana', () => {
  it('shifts the katakana block only', () => {
    expect(toHiragana('テレビ')).toBe('てれび');
    expect(toHiragana('キャッ')).toBe('きゃっ');
    expect(toHiragana('コーヒー')).toBe('こーひー');
    expect(toHiragana('やま。a')).toBe('やま。a');
  });

  it('round-trips with toKatakana', () => {
    expect(toHiragana(toKatakana('しんぶん'))).toBe('しんぶん');
  });
});
