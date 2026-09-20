import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';

import { RomajiInput } from '../romaji-input/romaji-input';
import { WordCheck, checkWord } from '../vocabulary/check-word';
import { Vocabulary } from '../vocabulary/vocabulary';
import { GameMode, gameModeInfo } from './game-mode';

@Component({
  selector: 'app-game',
  imports: [RomajiInput],
  templateUrl: './game.html',
  styleUrl: './game.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Game {
  readonly mode = input.required<GameMode>();

  protected readonly info = computed(() => gameModeInfo(this.mode()));
  protected readonly vocabulary = inject(Vocabulary);
  protected readonly word = signal('');

  // Editing the word drops the previous result, so a stale verdict never sits next to new input
  protected readonly check = linkedSignal<string, WordCheck | undefined>({
    source: this.word,
    computation: () => undefined,
  });

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.vocabulary.isReady()) {
      return;
    }

    this.check.set(checkWord(this.word(), (reading) => this.vocabulary.lookup(reading)));
  }
}
