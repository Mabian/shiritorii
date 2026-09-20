import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { RomajiInput } from './romaji-input/romaji-input';
import { WordCheck, checkWord } from './vocabulary/check-word';
import { Vocabulary } from './vocabulary/vocabulary';

@Component({
  imports: [RouterOutlet, RomajiInput],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
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
