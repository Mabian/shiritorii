import { Chain, checkWord } from './check-word';
import { LookupReading, VocabularyEntry } from './vocabulary-entry';

const FIXTURE: Readonly<Record<string, readonly VocabularyEntry[]>> = {
  もり: [{ kanji: '森', meaning: 'forest', tags: [] }],
  もち: [{ kanji: '餅', meaning: 'rice cake', tags: ['food'] }],
  さくら: [{ kanji: '桜', meaning: 'cherry tree; cherry blossom', tags: [] }],
  てれび: [{ kana: 'テレビ', meaning: 'television; TV', tags: ['abbr'] }],
  かみ: [
    { kanji: '紙', meaning: 'paper', tags: [] },
    { kanji: '神', meaning: 'god; deity', tags: [] },
  ],
};

const lookup: LookupReading = (reading) => FIXTURE[reading];

/** Answers link to こども, so everything valid has to start with も. */
const chain: Chain = { previous: 'こども', used: new Set() };

function check(input: string, over: Partial<Chain> = {}) {
  return checkWord(input, lookup, { ...chain, ...over });
}

describe('checkWord', () => {
  it('accepts a word that continues the chain', () => {
    expect(check('mori')).toEqual({
      status: 'ok',
      reading: 'もり',
      entries: FIXTURE['もり'],
    });
  });

  it('returns every homophone', () => {
    const result = check('kami', { previous: 'たなか' });

    expect(result.status).toBe('ok');
    expect(result.status === 'ok' && result.entries).toHaveLength(2);
  });

  it('finds katakana words through their hiragana reading', () => {
    expect(check('terebi', { previous: 'はて' }).status).toBe('ok');
    expect(check('TEREBI', { previous: 'はて' }).status).toBe('ok');
  });

  it('rejects a word ending in ん', () => {
    expect(check('ringonn')).toEqual({ status: 'ends-with-n', reading: 'りんごん' });
  });

  it('finishes a trailing n so the ん is caught rather than read as unfinished romaji', () => {
    expect(check('shinbun')).toEqual({ status: 'ends-with-n', reading: 'しんぶん' });
  });

  it('reports a word that is not in the vocabulary', () => {
    expect(check('yamayama')).toEqual({ status: 'unknown', reading: 'やまやま' });
  });

  it('reports a word that does not continue the chain', () => {
    expect(check('sakura')).toEqual({
      status: 'wrong-start',
      reading: 'さくら',
      expected: 'も',
    });
  });

  it('blames the dictionary before the chain', () => {
    expect(check('yamayama').status).toBe('unknown');
  });

  it('links on the normalised kana of the word before it', () => {
    expect(check('chi', { previous: 'こーひー' }).status).not.toBe('ok');
    expect(check('mochi', { previous: 'きんぎも' }).status).toBe('ok');
  });

  it('rejects a word that was already played', () => {
    expect(check('mori', { used: new Set(['もり']) })).toEqual({
      status: 'already-used',
      reading: 'もり',
    });
  });

  it('reports input that still holds romaji', () => {
    expect(check('ky')).toEqual({ status: 'incomplete' });
    expect(check('kyz')).toEqual({ status: 'incomplete' });
  });

  it('reports empty input', () => {
    expect(check('')).toEqual({ status: 'empty' });
    expect(check('   ')).toEqual({ status: 'empty' });
  });
});
