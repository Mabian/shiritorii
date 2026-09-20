import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';

import { routes } from './app.routes';

const VOCABULARY = { tagDescriptions: {}, words: {} };

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
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.querySelector('.home-mode')).not.toBeNull();
  });

  it('opens the game in the mode from the url', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/play/challenge');

    expect(harness.routeNativeElement?.querySelector('.game-mode-badge')?.textContent?.trim()).toBe(
      'Challenge',
    );
  });

  it('sends an unknown mode back to the mode selection', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/play/banana');

    expect(harness.routeNativeElement?.querySelector('.home-mode')).not.toBeNull();
  });

  it('sends an unknown url back to the mode selection', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/nowhere');

    expect(harness.routeNativeElement?.querySelector('.home-mode')).not.toBeNull();
  });
});
