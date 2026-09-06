import { TestBed } from '@angular/core/testing';
import { ProductRating } from './product-rating';

describe('ProductRating', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductRating],
    }).compileComponents();
  });

  it('renders the rate and count and an accessible label', () => {
    const fixture = TestBed.createComponent(ProductRating);
    fixture.componentRef.setInput('rate', 4.5);
    fixture.componentRef.setInput('count', 10);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.rating')?.getAttribute('aria-label')).toBe(
      'Rated 4.5 out of 5 from 10 reviews',
    );
    expect(compiled.querySelector('.rating__text')?.textContent).toContain('4.5');
    expect(compiled.querySelector('.rating__text')?.textContent).toContain('10');
  });

  it('labels a product with no reviews distinctly', () => {
    const fixture = TestBed.createComponent(ProductRating);
    fixture.componentRef.setInput('rate', 0);
    fixture.componentRef.setInput('count', 0);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.rating')?.getAttribute('aria-label')).toBe('No reviews yet');
  });

  it('fills 0% at a rate of 0 and 100% at a rate of 5', () => {
    const fixture = TestBed.createComponent(ProductRating);
    fixture.componentRef.setInput('rate', 0);
    fixture.componentRef.setInput('count', 1);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const fill = compiled.querySelector<HTMLElement>('.rating__stars-fill')!;
    expect(fill.style.width).toBe('0%');

    fixture.componentRef.setInput('rate', 5);
    fixture.detectChanges();
    expect(fill.style.width).toBe('100%');
  });

  it('clamps an out-of-range rate to 100% instead of overflowing', () => {
    const fixture = TestBed.createComponent(ProductRating);
    fixture.componentRef.setInput('rate', 7);
    fixture.componentRef.setInput('count', 1);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const fill = compiled.querySelector<HTMLElement>('.rating__stars-fill')!;
    expect(fill.style.width).toBe('100%');
  });
});
