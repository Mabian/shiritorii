import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { VocabularyEntry } from '../vocabulary/vocabulary-entry';
import { Vocabulary } from '../vocabulary/vocabulary';
import { GameSession } from './game-session';
import { OPENER_WORDS } from './opener-words';
import { SCORING } from './scoring';

/** A chain long enough that player and opponent never fight over the same word. */
const WORDS: Readonly<Record<string, readonly VocabularyEntry[]>> = {
  やま: [{ kanji: '山', meaning: 'mountain', tags: [] }],
  まち: [{ kanji: '町', meaning: 'town', tags: [] }],
  ちかてつ: [{ kanji: '地下鉄', meaning: 'subway', tags: [] }],
  つくえ: [{ kanji: '机', meaning: 'desk', tags: [] }],
  えき: [{ kanji: '駅', meaning: 'station', tags: [] }],
  きつね: [{ kanji: '狐', meaning: 'fox', tags: [] }],
  ちず: [{ kanji: '地図', meaning: 'map', tags: [] }],
};

const BY_START: Readonly<Record<string, readonly string[]>> = {
  や: ['やま'],
  ま: ['まち'],
  ち: ['ちかてつ'],
  つ: ['つくえ'],
  え: ['えき'],
  き: ['きつね'],
  ね: [],
};

/** Enough of the service for the session; the real one needs a 1.5 MB download. */
const vocabularyStub = {
  lookup: (reading: string) => WORDS[reading],
  wordsStartingWith: (kana: string) => BY_START[kana] ?? [],
};

/** Always draws the first candidate, so every run is the same. */
const firstChoice = () => 0;

const COUNTDOWN_MS = 4 * 700;
const THINKING_MS = 900;

describe('GameSession', () => {
  let session: GameSession;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [GameSession, { provide: Vocabulary, useValue: vocabularyStub }],
    });
    session = TestBed.inject(GameSession);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Runs the countdown and the opponent's opening turn. */
  function startChallenge(): void {
    session.start('challenge', firstChoice);
    vi.advanceTimersByTime(COUNTDOWN_MS + THINKING_MS);
  }

  it('counts down before anyone plays', () => {
    session.start('challenge', firstChoice);

    expect(session.phase()).toBe('countdown');
    expect(session.countdownText).toBe('三');

    vi.advanceTimersByTime(700);
    expect(session.countdownText).toBe('二');

    vi.advanceTimersByTime(1400);
    expect(session.countdownText).toBe('GO');
  });

  it('lets the opponent open and then hands over', () => {
    startChallenge();

    const [opening, prompt] = session.messages();
    expect(session.phase()).toBe('player');
    expect(opening.side).toBe('opponent');
    expect(OPENER_WORDS).toContain(opening.text);
    expect(prompt.side).toBe('system');
    expect(prompt.text).toContain(session.expectedKana);
  });

  it('keeps the clock still while the opponent is thinking', () => {
    session.start('challenge', firstChoice);
    vi.advanceTimersByTime(COUNTDOWN_MS);

    expect(session.phase()).toBe('opponent');
    vi.advanceTimersByTime(THINKING_MS - 1);
    expect(session.secondsLeft()).toBe(SCORING.startingSeconds);
  });

  it('runs the clock down on the player', () => {
    startChallenge();
    vi.advanceTimersByTime(3000);

    expect(session.secondsLeft()).toBeCloseTo(SCORING.startingSeconds - 3, 1);
  });

  it('pays time and points for a correct answer', () => {
    startChallenge();
    session.submit('machi');

    const answer = session.messages().find((message) => message.side === 'player');
    expect(answer?.text).toBe('まち');
    expect(answer?.invalid).toBeUndefined();
    expect(answer?.points).toBe(SCORING.basePoints);
    expect(session.score()).toBe(SCORING.basePoints);
    expect(session.secondsLeft()).toBe(SCORING.startingSeconds + SCORING.secondsPerWord);
    expect(session.wordsPlayed()).toBe(1);
  });

  it('multiplies a second answer in a row', () => {
    startChallenge();
    session.submit('machi');
    vi.advanceTimersByTime(THINKING_MS);
    session.submit('tsukue');

    expect(session.streak()).toBe(2);
    expect(session.score()).toBe(SCORING.basePoints + SCORING.basePoints * 2);
  });

  it('marks a wrong answer and keeps the player on the clock', () => {
    startChallenge();
    session.submit('chizu');

    const answer = session.messages().find((message) => message.side === 'player');
    expect(answer?.invalid).toBe(true);
    expect(answer?.text).toBe('ちず');
    expect(session.phase()).toBe('player');
    expect(session.score()).toBe(SCORING.wrongAnswerPoints);
    expect(session.streak()).toBe(0);
  });

  it('explains why an answer was refused', () => {
    startChallenge();
    session.submit('chizu');

    const note = session.messages().at(-1);
    expect(note?.side).toBe('system');
    expect(note?.text).toContain('has to start with');
  });

  it('names the noun rule when the word is not in the vocabulary', () => {
    startChallenge();
    session.submit('marumaru');

    const note = session.messages().at(-1);
    expect(note?.text).toContain('is not a noun in the dictionary');
    expect(note?.text).toContain('Only nouns count');
  });

  it('ends when the clock runs out', () => {
    startChallenge();
    vi.advanceTimersByTime(SCORING.startingSeconds * 1000);

    expect(session.phase()).toBe('over');
    expect(session.ending()).toBe('time-up');
    expect(session.secondsLeft()).toBe(0);
  });

  it('shows a word that would have kept the game going', () => {
    startChallenge();
    vi.advanceTimersByTime(SCORING.startingSeconds * 1000);

    // The opening is やま, so anything starting with ま would have done.
    expect(session.missedWord()).toEqual({ reading: 'まち', meaning: 'town' });
  });

  it('spares the winner the advice', () => {
    startChallenge();
    session.submit('machi');
    vi.advanceTimersByTime(THINKING_MS);
    session.submit('tsukue');
    vi.advanceTimersByTime(THINKING_MS);
    session.submit('kitsune');

    expect(session.ending()).toBe('opponent-stuck');
    expect(session.missedWord()).toBeUndefined();
  });

  describe('the skip', () => {
    it('has the opponent pick another word and charges the clock', () => {
      startChallenge();
      const first = session.messages()[0].text;

      session.skip();
      expect(session.secondsLeft()).toBe(SCORING.startingSeconds - SCORING.skipCost);
      vi.advanceTimersByTime(THINKING_MS);

      const words = session.messages().filter((message) => message.side === 'opponent');
      expect(words).toHaveLength(2);
      expect(words[1].text).not.toBe(first);
      expect(session.phase()).toBe('player');
    });

    it('can only be used once', () => {
      startChallenge();
      expect(session.canSkip()).toBe(true);

      session.skip();
      vi.advanceTimersByTime(THINKING_MS);

      expect(session.skipUsed()).toBe(true);
      expect(session.canSkip()).toBe(false);
    });

    it('stays shut once the clock is down to the cost', () => {
      startChallenge();
      vi.advanceTimersByTime((SCORING.startingSeconds - SCORING.skipCost) * 1000);

      expect(session.secondsLeft()).toBeCloseTo(SCORING.skipCost, 1);
      expect(session.canSkip()).toBe(false);
    });

    it('does nothing in practice, where there is no clock to spend', () => {
      session.start('practice', firstChoice);
      vi.advanceTimersByTime(COUNTDOWN_MS + THINKING_MS);

      expect(session.canSkip()).toBe(false);
      session.skip();
      expect(session.skipUsed()).toBe(false);
    });

    it('comes back on a new run', () => {
      startChallenge();
      session.skip();
      session.start('challenge', firstChoice);

      expect(session.skipUsed()).toBe(false);
    });
  });

  it('ends when the player gives up', () => {
    startChallenge();
    session.giveUp();

    expect(session.phase()).toBe('over');
    expect(session.ending()).toBe('gave-up');
  });

  it('ends when the opponent has no word left', () => {
    startChallenge();
    session.submit('machi');
    vi.advanceTimersByTime(THINKING_MS);
    session.submit('tsukue');
    vi.advanceTimersByTime(THINKING_MS);
    session.submit('kitsune');

    expect(session.phase()).toBe('over');
    expect(session.ending()).toBe('opponent-stuck');
  });

  it('keeps neither clock nor score in practice', () => {
    session.start('practice', firstChoice);
    vi.advanceTimersByTime(COUNTDOWN_MS + THINKING_MS);
    vi.advanceTimersByTime(10_000);
    session.submit('machi');

    expect(session.scored()).toBe(false);
    expect(session.score()).toBe(0);
    expect(session.secondsLeft()).toBe(SCORING.startingSeconds);
    expect(session.messages().find((message) => message.side === 'player')?.points).toBeUndefined();
  });

  it('starts over cleanly when played again', () => {
    startChallenge();
    session.submit('machi');
    session.start('challenge', firstChoice);

    expect(session.phase()).toBe('countdown');
    expect(session.missedWord()).toBeUndefined();
    expect(session.messages()).toEqual([]);
    expect(session.score()).toBe(0);
    expect(session.secondsLeft()).toBe(SCORING.startingSeconds);
  });
});
