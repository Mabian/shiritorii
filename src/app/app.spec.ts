import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
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

  it('should render the romaji input', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-romaji-input input')).toBeTruthy();
  });
});
