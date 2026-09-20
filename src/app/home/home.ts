import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { GAME_MODES } from '../game/game-mode';
import { Vocabulary } from '../vocabulary/vocabulary';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly modes = GAME_MODES;

  // Injected here so the dictionary starts downloading while the player is still picking a mode,
  // rather than making them wait once the game has already opened.
  protected readonly vocabulary = inject(Vocabulary);
}
