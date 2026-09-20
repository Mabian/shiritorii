import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { Vocabulary } from '../vocabulary/vocabulary';
import { Game } from './game';

const vocabularyStub = {
  isReady: () => true,
  isLoading: () => false,
  hasFailed: () => false,
  lookup: (reading: string) =>
    reading === 'まち' ? [{ kanji: '町', meaning: 'town', tags: [] }] : undefined,
  wordsStartingWith: (kana: string) => (kana === 'ま' ? ['まち'] : []),
  describeTag: (tag: string) => tag,
};

describe('Game', () => {
  let fixture: ComponentFixture<Game>;
  let element: HTMLElement;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [Game],
      providers: [provideRouter([]), { provide: Vocabulary, useValue: vocabularyStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(Game);
    fixture.componentRef.setInput('mode', 'challenge');
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens with the countdown', () => {
    expect(element.querySelector('.game-countdown')?.textContent?.trim()).toBe('三');
  });

  it('shows the conversation once the opponent has opened', () => {
    vi.advanceTimersByTime(4 * 700 + 900);
    fixture.detectChanges();

    expect(element.querySelector('app-game-chat')).not.toBeNull();
    expect(element.querySelector('.game-chat-item-opponent')).not.toBeNull();
    expect(element.querySelector('input')).not.toBeNull();
  });

  it('runs a clock in challenge mode', () => {
    vi.advanceTimersByTime(4 * 700 + 900);
    fixture.detectChanges();

    expect(element.querySelector('.game-clock')).not.toBeNull();
  });

  it('offers a skip that the clock has to pay for', () => {
    vi.advanceTimersByTime(4 * 700 + 900);
    fixture.detectChanges();

    const skip = element.querySelector<HTMLButtonElement>('.game-skip');
    expect(skip?.disabled).toBe(false);
    expect(skip?.textContent).toContain('-10s');

    skip?.click();
    fixture.detectChanges();

    expect(element.querySelector<HTMLButtonElement>('.game-skip')?.disabled).toBe(true);
  });

  it('shows the score once the player gives up', () => {
    vi.advanceTimersByTime(4 * 700 + 900);
    fixture.detectChanges();

    element.querySelector<HTMLButtonElement>('.game-give-up')?.click();
    fixture.detectChanges();

    expect(element.querySelector('.game-over-reason')?.textContent).toContain('gave up');
    expect(element.querySelector('.game-over-score')).not.toBeNull();
  });
});
