import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  input,
} from '@angular/core';

import { ChatMessage } from './chat-message';

@Component({
  selector: 'app-game-chat',
  templateUrl: './game-chat.html',
  styleUrl: './game-chat.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameChat {
  readonly messages = input.required<readonly ChatMessage[]>();
  readonly thinking = input(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterRenderEffect(() => {
      this.messages();
      this.thinking();

      const element = this.host.nativeElement;
      element.scrollTop = element.scrollHeight;
    });
  }
}
