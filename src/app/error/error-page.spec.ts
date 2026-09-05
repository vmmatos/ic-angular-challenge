import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ErrorPage } from './error-page';

describe('ErrorPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the default 404 copy', () => {
    const fixture = TestBed.createComponent(ErrorPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-page__status')?.textContent).toContain('404');
    expect(compiled.querySelector('h2')?.textContent).toContain('Page not found');
  });

  it('links back to the products overview', () => {
    const fixture = TestBed.createComponent(ErrorPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/products');
  });
});
