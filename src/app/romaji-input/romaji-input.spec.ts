import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RomajiInput } from './romaji-input';

describe('RomajiInput', () => {
  let fixture: ComponentFixture<RomajiInput>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RomajiInput] }).compileComponents();
    fixture = TestBed.createComponent(RomajiInput);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  function field(): HTMLInputElement {
    const input = element.querySelector('input');
    if (input === null) {
      throw new Error('input field not found');
    }
    return input;
  }

  function mirrorChars(): readonly HTMLElement[] {
    return [...element.querySelectorAll<HTMLElement>('.romaji-input-char')];
  }

  /** Types character by character, the way a browser would. */
  async function type(text: string): Promise<void> {
    for (const char of text) {
      const input = field();
      input.value += char;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    }
  }

  it('converts romaji to kana while typing', async () => {
    await type('kya');

    expect(field().value).toBe('きゃ');
    expect(mirrorChars().map((char) => char.textContent)).toEqual(['き', 'ゃ']);
  });

  it('shows incomplete romaji as a pending leftover', async () => {
    await type('ky');

    expect(field().value).toBe('ky');
    expect(
      mirrorChars().every((char) => char.classList.contains('romaji-input-char-pending')),
    ).toBe(true);
  });

  it('marks only the leftover, not the finished kana', async () => {
    await type('shinbunk');

    const pending = mirrorChars().filter((char) =>
      char.classList.contains('romaji-input-char-pending'),
    );
    expect(pending.map((char) => char.textContent)).toEqual(['k']);
  });

  it('leaves converted kana untouched when deleting', async () => {
    await type('kya');

    const input = field();
    input.value = 'き';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(input.value).toBe('き');
    expect(fixture.componentInstance.value()).toBe('き');
  });

  it('inserts mid-word and keeps the caret there', async () => {
    await type('kiku');

    const input = field();
    input.value = 'きkaく';
    input.setSelectionRange(3, 3);
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(input.value).toBe('きかく');
    expect(input.selectionStart).toBe(2);
  });

  it('wraps the field in its label and links the hint', () => {
    const label = element.querySelector('label');
    const hint = element.querySelector('.romaji-input-hint');

    expect(label?.contains(field())).toBe(true);
    expect(field().getAttribute('aria-describedby')).toBe(hint?.id);
  });
});
