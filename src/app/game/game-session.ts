import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

import { linkingKana } from '../kana/linking-kana';
import { WordCheck, checkWord } from '../vocabulary/check-word';
import { Vocabulary } from '../vocabulary/vocabulary';
import { ChatMessage } from './chat-message';
import { GameMode } from './game-mode';
import { OPENER_WORDS } from './opener-words';
import { Random, chooseWord } from './opponent';
import { SCORING, awardForCorrect } from './scoring';

export type GamePhase = 'countdown' | 'opponent' | 'player' | 'over';
export type GameEnding = 'time-up' | 'gave-up' | 'opponent-stuck';

export interface MissedWord {
  readonly reading: string;
  readonly meaning?: string;
}

const COUNTDOWN_STEPS = ['三', '二', '一', 'GO'] as const;
const COUNTDOWN_STEP_MS = 700;
const OPPONENT_THINKING_MS = 900;
const TICK_MS = 100;

@Injectable()
export class GameSession {
  private readonly vocabulary = inject(Vocabulary);

  readonly phase = signal<GamePhase>('countdown');
  readonly countdownStep = signal(0);
  readonly messages = signal<readonly ChatMessage[]>([]);
  readonly secondsLeft = signal<number>(SCORING.startingSeconds);
  readonly score = signal(0);
  readonly streak = signal(0);
  readonly longestStreak = signal(0);
  readonly wordsPlayed = signal(0);
  readonly ending = signal<GameEnding | undefined>(undefined);
  readonly missedWord = signal<MissedWord | undefined>(undefined);
  readonly skipUsed = signal(false);

  readonly canSkip = computed(
    () =>
      this.scored() &&
      this.phase() === 'player' &&
      !this.skipUsed() &&
      this.secondsLeft() > SCORING.skipCost,
  );

  readonly scored = signal(false);

  private random: Random = Math.random;
  private readonly previous = signal('');
  private readonly used = new Set<string>();

  private drewFrom: string | undefined;
  private nextMessageId = 0;

  private timer: ReturnType<typeof setTimeout> | undefined;
  private ticker: ReturnType<typeof setInterval> | undefined;

  private bankedSeconds: number = SCORING.startingSeconds;
  private runningSince = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopClocks());
  }

  get countdownText(): string {
    return COUNTDOWN_STEPS[Math.min(this.countdownStep(), COUNTDOWN_STEPS.length - 1)];
  }

  get expectedKana(): string {
    return linkingKana(this.previous());
  }

  start(mode: GameMode, random: Random = Math.random): void {
    this.stopClocks();
    this.scored.set(mode === 'challenge');
    this.random = random;

    this.previous.set('');
    this.used.clear();
    this.drewFrom = undefined;
    this.skipUsed.set(false);
    this.messages.set([]);
    this.secondsLeft.set(SCORING.startingSeconds);
    this.bankedSeconds = SCORING.startingSeconds;
    this.score.set(0);
    this.streak.set(0);
    this.longestStreak.set(0);
    this.wordsPlayed.set(0);
    this.ending.set(undefined);
    this.missedWord.set(undefined);
    this.nextMessageId = 0;

    this.runCountdown();
  }

  submit(input: string): void {
    if (this.phase() !== 'player') {
      return;
    }

    const result = checkWord(input, (reading) => this.vocabulary.lookup(reading), {
      previous: this.previous(),
      used: this.used,
    });

    if (result.status === 'empty') {
      return;
    }
    if (result.status === 'ok') {
      this.acceptAnswer(result.reading, result.entries[0]?.meaning);
      return;
    }
    this.rejectAnswer(result);
  }

  giveUp(): void {
    this.finish('gave-up');
  }

  skip(): void {
    if (!this.canSkip()) {
      return;
    }

    this.skipUsed.set(true);
    this.addSeconds(-SCORING.skipCost);
    this.say({ side: 'system', text: `Skipped, -${SCORING.skipCost} seconds` });
    this.opponentTurn(this.drawOpponentWord());
  }

  private runCountdown(): void {
    this.phase.set('countdown');
    this.countdownStep.set(0);

    const step = () => {
      if (this.countdownStep() + 1 >= COUNTDOWN_STEPS.length) {
        this.opponentTurn(this.drawOpponentWord());
        return;
      }
      this.countdownStep.update((value) => value + 1);
      this.timer = setTimeout(step, COUNTDOWN_STEP_MS);
    };

    this.timer = setTimeout(step, COUNTDOWN_STEP_MS);
  }

  private opponentTurn(reading: string | undefined): void {
    this.pauseClock();
    // Pausing settles the clock and may have ended the run on the spot. Reopening it here would
    // silently un-finish the game.
    if (this.phase() === 'over') {
      return;
    }

    this.phase.set('opponent');

    if (reading === undefined) {
      this.finish('opponent-stuck');
      return;
    }

    this.timer = setTimeout(() => {
      this.previous.set(reading);
      this.used.add(reading);
      this.say({
        side: 'opponent',
        text: reading,
        meaning: this.vocabulary.lookup(reading)?.[0]?.meaning,
      });
      this.say({ side: 'system', text: `Your turn: link to ${this.expectedKana}` });
      this.phase.set('player');
      this.resumeClock();
    }, OPPONENT_THINKING_MS);
  }

  private acceptAnswer(reading: string, meaning: string | undefined): void {
    const streak = this.streak() + 1;
    this.streak.set(streak);
    this.longestStreak.update((longest) => Math.max(longest, streak));
    this.wordsPlayed.update((count) => count + 1);
    this.used.add(reading);
    this.previous.set(reading);

    if (this.scored()) {
      const award = awardForCorrect(streak, this.secondsLeft());
      this.score.update((points) => points + award.points);
      this.addSeconds(award.secondsGained);
      this.say({
        side: 'player',
        text: reading,
        meaning,
        points: award.points,
        multiplier: award.multiplier,
      });
    } else {
      this.say({ side: 'player', text: reading, meaning });
    }

    this.drewFrom = this.expectedKana;
    this.opponentTurn(this.drawOpponentWord());
  }

  private drawOpponentWord(): string | undefined {
    const candidates =
      this.drewFrom === undefined ? OPENER_WORDS : this.vocabulary.wordsStartingWith(this.drewFrom);

    return chooseWord(candidates, this.used, this.random);
  }

  private rejectAnswer(result: Exclude<WordCheck, { status: 'ok' } | { status: 'empty' }>): void {
    this.streak.set(0);
    if (this.scored()) {
      this.score.update((points) => points + SCORING.wrongAnswerPoints);
    }

    this.say({
      side: 'player',
      text: result.status === 'incomplete' ? '…' : result.reading,
      invalid: true,
      points: this.scored() ? SCORING.wrongAnswerPoints : undefined,
    });
    this.say({ side: 'system', text: explain(result, this.expectedKana) });
  }

  private say(message: Omit<ChatMessage, 'id'>): void {
    this.nextMessageId += 1;
    const id = this.nextMessageId;
    this.messages.update((messages) => [...messages, { ...message, id }]);
  }

  private addSeconds(seconds: number): void {
    this.bankedSeconds = Math.min(SCORING.maxSeconds, this.secondsLeft() + seconds);
    this.runningSince = performance.now();
    this.secondsLeft.set(this.bankedSeconds);
  }

  private resumeClock(): void {
    if (!this.scored()) {
      return;
    }
    this.bankedSeconds = this.secondsLeft();
    this.runningSince = performance.now();
    this.ticker = setInterval(() => this.tick(), TICK_MS);
  }

  private pauseClock(): void {
    if (this.ticker !== undefined) {
      this.tick();
      clearInterval(this.ticker);
      this.ticker = undefined;
    }
    this.bankedSeconds = this.secondsLeft();
  }

  /** Counted off a timestamp rather than by adding up ticks, so nothing drifts over a long run. */
  private tick(): void {
    const elapsed = (performance.now() - this.runningSince) / 1000;
    const left = Math.max(0, this.bankedSeconds - elapsed);
    this.secondsLeft.set(left);

    if (left === 0) {
      this.finish('time-up');
    }
  }

  private finish(ending: GameEnding): void {
    if (this.phase() === 'over') {
      return;
    }

    // Only worth showing when the player was the one on the spot. A player who outlasted the
    // opponent does not need to be told what they could have said.
    if (ending !== 'opponent-stuck' && this.phase() === 'player') {
      this.missedWord.set(this.findMissedWord());
    }

    this.stopClocks();
    this.ending.set(ending);
    this.phase.set('over');
  }

  private findMissedWord(): MissedWord | undefined {
    const reading = chooseWord(
      this.vocabulary.wordsStartingWith(this.expectedKana),
      this.used,
      this.random,
    );

    return reading === undefined
      ? undefined
      : { reading, meaning: this.vocabulary.lookup(reading)?.[0]?.meaning };
  }

  private stopClocks(): void {
    clearTimeout(this.timer);
    clearInterval(this.ticker);
    this.timer = undefined;
    this.ticker = undefined;
  }
}

function explain(result: WordCheck, expected: string): string {
  switch (result.status) {
    case 'incomplete':
      return 'That still has unfinished romaji in it. Try again.';
    case 'ends-with-n':
      return `${result.reading} ends in ん, which would lose the game. Try again.`;
    case 'unknown':
      // The vocabulary holds nouns only, so an unknown word is just as likely a verb or an
      // adjective the player expected to work. Saying so saves them guessing.
      return `${result.reading} is not a noun in the dictionary. Only nouns count in shiritori. Try again.`;
    case 'wrong-start':
      return `${result.reading} has to start with ${expected}. Try again.`;
    case 'already-used':
      return `${result.reading} has already been played. Try again.`;
    default:
      return 'Try again.';
  }
}
