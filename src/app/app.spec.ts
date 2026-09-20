import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
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

  it('should send the title back to the start page', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-title-link')?.getAttribute('href')).toBe('/');
  });

  it('should explain the wordmark under the title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-tagline')?.textContent).toContain('two i');
  });

  it('should credit the dictionary source', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-footer')?.textContent).toContain('JMdict');
  });
});
