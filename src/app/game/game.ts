import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { RomajiInput } from '../romaji-input/romaji-input';
import { Vocabulary } from '../vocabulary/vocabulary';
import { GameChat } from './game-chat';
import { GameMode } from './game-mode';
import { GameSession } from './game-session';
import { SCORING } from './scoring';

const ENDING_TEXT: Readonly<Record<string, string>> = {
  'time-up': 'Time up',
  'gave-up': 'You gave up',
  'opponent-stuck': 'The opponent ran out of words',
};

@Component({
  selector: 'app-game',
  imports: [RomajiInput, GameChat, RouterLink],
  providers: [GameSession],
  templateUrl: './game.html',
  styleUrl: './game.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Game {
  readonly mode = input.required<GameMode>();

  protected readonly session = inject(GameSession);
  protected readonly vocabulary = inject(Vocabulary);
  protected readonly word = signal('');

  protected readonly clockPercent = computed(
    () => (this.session.secondsLeft() / SCORING.maxSeconds) * 100,
  );
  protected readonly clockText = computed(() => this.session.secondsLeft().toFixed(1));
  protected readonly skipCost = SCORING.skipCost;
  protected readonly skipTitle = computed(() =>
    this.session.skipUsed()
      ? 'You have already skipped once this run'
      : `Have the opponent pick another word, for ${SCORING.skipCost} seconds`,
  );
  protected readonly endingText = computed(() => ENDING_TEXT[this.session.ending() ?? ''] ?? '');

  private started = false;

  constructor() {
    // Kicks the run off once the dictionary is there, because without it the opponent cannot answer.
    effect(() => {
      if (!this.started && this.vocabulary.isReady()) {
        this.started = true;
        this.session.start(this.mode());
      }
    });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    // Typing on through the opponent's turn is fine, but it must not be swallowed here.
    if (this.session.phase() !== 'player') {
      return;
    }

    this.session.submit(this.word());
    this.word.set('');
  }

  protected playAgain(): void {
    this.word.set('');
    this.session.start(this.mode());
  }
}
