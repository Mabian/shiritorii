import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GAME_MODES } from '../game/game-mode';
import { Home } from './home';

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('offers a card per game mode', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const cards = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.home-mode')];

    expect(cards.map((card) => card.getAttribute('href'))).toEqual([
      '/play/practice',
      '/play/challenge',
    ]);
    expect(cards.map((card) => card.querySelector('.home-mode-name')?.textContent)).toEqual([
      'Practice',
      'Challenge',
    ]);
  });

  it('asks for a mode and explains what each one does', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.home-heading')?.textContent).toBe('Choose your mode');
    for (const mode of GAME_MODES) {
      expect(compiled.textContent).toContain(mode.summary);
    }
  });

  it('carries the wordmark', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.home-title-kana')?.textContent).toBe('しりとり');
    expect(compiled.querySelector('.home-title-latin')?.textContent?.replace('⛩️', '')).toBe(
      'Shiritorii',
    );
    expect(compiled.querySelector('.home-tagline')?.textContent).toContain('two i');
  });

  it('does not hold a word input', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('input')).toBeNull();
  });
});
