import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  model,
  viewChild,
} from '@angular/core';

import { toKana } from '../kana/to-kana';

interface MirrorChar {
  readonly key: string;
  readonly char: string;
  readonly isPending: boolean;
}

@Component({
  selector: 'app-romaji-input',
  templateUrl: './romaji-input.html',
  styleUrl: './romaji-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'romaji-input' },
})
export class RomajiInput {
  // exactly what the field shows
  readonly value = model('');

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  private readonly conversion = computed(() => toKana(this.value()));

  protected readonly chars = computed<readonly MirrorChar[]>(() => {
    const { kana, pending } = this.conversion();
    const kanaLength = [...kana].length;

    return [...(kana + pending)].map((char, index) => ({
      key: `${index}:${char}`,
      char,
      isPending: index >= kanaLength,
    }));
  });

  constructor() {
    effect(() => {
      const field = this.field().nativeElement;
      const value = this.value();
      if (field.value !== value) {
        field.value = value;
      }
    });
  }

  protected onInput(event: Event): void {
    const field = event.target as HTMLInputElement;
    const caret = field.selectionStart ?? field.value.length;

    // Convert the text before the caret separately: its length is the new caret position
    const caretPosition = displayText(field.value.slice(0, caret)).length;
    const result = toKana(field.value);
    const converted = result.kana + result.pending;

    field.value = converted;
    field.setSelectionRange(caretPosition, caretPosition);
    this.value.set(converted);
  }
}

function displayText(input: string): string {
  const { kana, pending } = toKana(input);
  return kana + pending;
}
