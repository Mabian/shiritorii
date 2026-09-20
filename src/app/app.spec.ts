import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { App } from './app';

const VOCABULARY = {
  tagDescriptions: { abbr: 'abbreviation' },
  words: { さくら: [{ kanji: '桜', meaning: 'cherry tree; cherry blossom', tags: [] }] },
};

describe('App', () => {
  beforeEach(async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(VOCABULARY), { status: 200 }),
    );
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the title in kana', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-title-kana')?.textContent).toBe('しりとり');
  });

  it('should spell out Shiritorii behind the decorative torii', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const wordmark = compiled.querySelector('.app-title-latin');
    expect(compiled.querySelector('.app-title-torii')?.getAttribute('aria-hidden')).toBe('true');
    expect(wordmark?.textContent?.replace('⛩️', '')).toBe('Shiritorii');
  });

  it('should credit the dictionary source', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-footer')?.textContent).toContain('JMdict');
  });

  it('should check the submitted word against the vocabulary', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const input = compiled.querySelector('input');
    if (input === null) {
      throw new Error('input field not found');
    }
    input.value = 'sakura';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    compiled.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    const result = compiled.querySelector('.app-result');
    expect(result?.textContent).toContain('桜');
    expect(result?.textContent).toContain('cherry tree');
  });
});
