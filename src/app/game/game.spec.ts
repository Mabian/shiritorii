import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Game } from './game';

const VOCABULARY = {
  tagDescriptions: { abbr: 'abbreviation' },
  words: { さくら: [{ kanji: '桜', meaning: 'cherry tree; cherry blossom', tags: [] }] },
};

describe('Game', () => {
  let fixture: ComponentFixture<Game>;
  let element: HTMLElement;

  beforeEach(async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(VOCABULARY), { status: 200 }),
    );
    await TestBed.configureTestingModule({ imports: [Game] }).compileComponents();

    fixture = TestBed.createComponent(Game);
    fixture.componentRef.setInput('mode', 'practice');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('names the mode it was started in', () => {
    expect(element.querySelector('.game-mode-badge')?.textContent?.trim()).toBe('Practice');
  });

  it('checks the submitted word against the vocabulary', async () => {
    const input = element.querySelector('input');
    if (input === null) {
      throw new Error('input field not found');
    }
    input.value = 'sakura';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    element.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    const result = element.querySelector('.game-result');
    expect(result?.textContent).toContain('桜');
    expect(result?.textContent).toContain('cherry tree');
  });

  it('drops the previous verdict once the word is edited again', async () => {
    const input = element.querySelector('input');
    if (input === null) {
      throw new Error('input field not found');
    }
    input.value = 'sakura';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    element.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(element.querySelector('.game-result')).not.toBeNull();

    input.value = 'sakurak';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(element.querySelector('.game-result')).toBeNull();
  });
});
