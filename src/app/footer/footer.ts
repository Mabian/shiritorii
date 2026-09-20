import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { Legal } from '../legal/legal';

@Component({
  selector: 'app-footer',
  imports: [Legal],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'menuOpen.set(false)',
    '(document:keydown.escape)': 'menuOpen.set(false)',
  },
})
export class Footer {
  /** Only used below the breakpoint, where the links collapse into a menu. */
  protected readonly menuOpen = signal(false);

  protected toggleMenu(event: Event): void {
    // Without this the click would travel on to the document listener and close the menu again.
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
  }
}
