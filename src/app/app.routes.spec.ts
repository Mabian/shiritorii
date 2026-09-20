import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';

import { routes } from './app.routes';
import { Game } from './game/game';
import { Home } from './home/home';

const VOCABULARY = { words: {} };

describe('routes', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(VOCABULARY), { status: 200 }),
    );
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts on the mode selection', async () => {
    const harness = await RouterTestingHarness.create();
    expect(await harness.navigateByUrl('/')).toBeInstanceOf(Home);
  });

  it('opens the game from the url', async () => {
    const harness = await RouterTestingHarness.create();
    const game = await harness.navigateByUrl('/play/challenge', Game);

    expect(game).toBeInstanceOf(Game);
    expect(game.mode()).toBe('challenge');
  });

  it('sends an unknown mode back to the mode selection', async () => {
    const harness = await RouterTestingHarness.create();
    expect(await harness.navigateByUrl('/play/banana')).toBeInstanceOf(Home);
  });

  it('sends an unknown url back to the mode selection', async () => {
    const harness = await RouterTestingHarness.create();
    expect(await harness.navigateByUrl('/nowhere')).toBeInstanceOf(Home);
  });
});
