import { checkWord } from './check-word';
import { LookupReading, VocabularyEntry } from './vocabulary-entry';

const FIXTURE: Readonly<Record<string, readonly VocabularyEntry[]>> = {
  さくら: [{ kanji: '桜', meaning: 'cherry tree; cherry blossom', tags: [] }],
  てれび: [{ kana: 'テレビ', meaning: 'television; TV', tags: ['abbr'] }],
  かみ: [
    { kanji: '紙', meaning: 'paper', tags: [] },
    { kanji: '神', meaning: 'god; deity', tags: [] },
  ],
};

const lookup: LookupReading = (reading) => FIXTURE[reading];

describe('checkWord', () => {
  it('accepts a word that is in the vocabulary', () => {
    expect(checkWord('sakura', lookup)).toEqual({
      status: 'ok',
      reading: 'さくら',
      entries: FIXTURE['さくら'],
    });
  });

  it('returns every homophone', () => {
    const check = checkWord('kami', lookup);

    expect(check.status).toBe('ok');
    expect(check.status === 'ok' && check.entries).toHaveLength(2);
  });

  it('finds katakana words through their hiragana reading', () => {
    expect(checkWord('terebi', lookup).status).toBe('ok');
    expect(checkWord('TEREBI', lookup).status).toBe('ok');
  });

  it('rejects a word ending in ん', () => {
    expect(checkWord('ringonn', lookup)).toEqual({ status: 'ends-with-n', reading: 'りんごん' });
  });

  it('finishes a trailing n so the ん is caught rather than read as unfinished romaji', () => {
    expect(checkWord('shinbun', lookup)).toEqual({ status: 'ends-with-n', reading: 'しんぶん' });
  });

  it('reports a word that is not in the vocabulary', () => {
    expect(checkWord('yamayama', lookup)).toEqual({ status: 'unknown', reading: 'やまやま' });
  });

  it('reports input that still holds romaji', () => {
    expect(checkWord('ky', lookup)).toEqual({ status: 'incomplete' });
    expect(checkWord('kyz', lookup)).toEqual({ status: 'incomplete' });
  });

  it('reports empty input', () => {
    expect(checkWord('', lookup)).toEqual({ status: 'empty' });
    expect(checkWord('   ', lookup)).toEqual({ status: 'empty' });
  });
});
