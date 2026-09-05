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

  it('renders custom status, heading, and message when provided', () => {
    const fixture = TestBed.createComponent(ErrorPage);
    fixture.componentRef.setInput('status', 404);
    fixture.componentRef.setInput('heading', 'Product not found');
    fixture.componentRef.setInput('message', "We couldn't find the product you're looking for.");
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Product not found');
    expect(compiled.textContent).toContain("We couldn't find the product you're looking for.");
  });
});
