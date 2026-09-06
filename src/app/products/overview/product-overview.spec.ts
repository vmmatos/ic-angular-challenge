import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideQueryClient, QueryClient } from '@ngneat/query';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { ComponentFixture } from '@angular/core/testing';
import { ProductOverview } from './product-overview';
import { API_URL } from '../data/products-api';
import { Product } from '../data/product';

async function settle(fixture: ComponentFixture<ProductOverview>): Promise<void> {
  await vi.waitFor(() => {
    fixture.detectChanges();
    expect(fixture.componentInstance.result().isPending).toBe(false);
  });
  fixture.detectChanges();
}

const product: Product = {
  id: 1,
  title: 'Test product',
  price: 9.99,
  description: 'A product used in tests',
  category: 'testing',
  image: 'https://example.com/image.png',
  rating: { rate: 4.5, count: 10 },
};

const otherProduct: Product = {
  id: 2,
  title: 'Another product',
  price: 19.99,
  description: 'A second product in a different category',
  category: 'other',
  image: 'https://example.com/other.png',
  rating: { rate: 3, count: 2 },
};

describe('ProductOverview', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductOverview],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideQueryClient(
          () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
        ),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shows a loading state before the request resolves', async () => {
    const fixture = TestBed.createComponent(ProductOverview);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="status"]')?.textContent).toContain('Loading products');

    httpMock.expectOne(API_URL).flush([product]);
    await settle(fixture);
  });

  it('renders a link to the product creation form', async () => {
    const fixture = TestBed.createComponent(ProductOverview);
    fixture.detectChanges();

    httpMock.expectOne(API_URL).flush([product]);
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const addLink = compiled.querySelector<HTMLAnchorElement>('.overview__add');
    expect(addLink?.getAttribute('href')).toBe('/products/new');
  });

  it('renders a card per product on success, with a decorative image and a rating', async () => {
    const fixture = TestBed.createComponent(ProductOverview);
    fixture.detectChanges();

    httpMock.expectOne(API_URL).flush([product]);
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.product-card');
    expect(cards.length).toBe(1);

    const image = compiled.querySelector<HTMLImageElement>('.product-card__image');
    expect(image?.alt).toBe('');
    expect(compiled.querySelector('.product-card__title')?.textContent).toContain(product.title);
    expect(compiled.querySelector('.product-card__price')?.textContent).toContain('9.99');
    expect(compiled.querySelector('.product-card__description')?.textContent).toBe(
      product.description,
    );

    const rating = compiled.querySelector('.product-card__rating .rating');
    expect(rating?.getAttribute('aria-label')).toBe('Rated 4.5 out of 5 from 10 reviews');
  });

  it('shows an empty state when there are no products', async () => {
    const fixture = TestBed.createComponent(ProductOverview);
    fixture.detectChanges();

    httpMock.expectOne(API_URL).flush([]);
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="status"]')?.textContent).toContain('No products found');
  });

  it('shows an error state and retries the request', async () => {
    const fixture = TestBed.createComponent(ProductOverview);
    fixture.detectChanges();

    httpMock.expectOne(API_URL).flush('failure', { status: 500, statusText: 'Server Error' });
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const alert = compiled.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("couldn't load the products");

    const retryButton = compiled.querySelector<HTMLButtonElement>('[role="alert"] button');
    retryButton?.click();

    const retryReq = await vi.waitFor(() => httpMock.expectOne(API_URL));
    retryReq.flush([product]);
    await settle(fixture);
  });

  it('derives a deduped, sorted category list from the loaded products', async () => {
    const fixture = TestBed.createComponent(ProductOverview);
    fixture.detectChanges();

    httpMock.expectOne(API_URL).flush([otherProduct, product, { ...product, id: 3 }]);
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const chips = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('.categories__chip')).map(
      (chip) => chip.textContent?.trim(),
    );

    expect(chips).toEqual(['All', 'other', 'testing']);
  });

  it('shows every product and the "showing N of M" count when no category filter is set', async () => {
    const fixture = TestBed.createComponent(ProductOverview);
    fixture.detectChanges();

    httpMock.expectOne(API_URL).flush([product, otherProduct]);
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.product-card').length).toBe(2);
    expect(compiled.querySelector('.overview__count')?.textContent).toContain(
      'Showing 2 of 2 products',
    );

    const allChip = compiled.querySelector('.categories__chip[aria-current="true"]');
    expect(allChip?.textContent?.trim()).toBe('All');
  });

  it('filters the grid to the selected category', async () => {
    const fixture = TestBed.createComponent(ProductOverview);
    fixture.componentRef.setInput('category', 'testing');
    fixture.detectChanges();

    httpMock.expectOne(API_URL).flush([product, otherProduct]);
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.product-card');
    expect(cards.length).toBe(1);
    expect(compiled.querySelector('.product-card__title')?.textContent).toContain(product.title);
    expect(compiled.querySelector('.overview__count')?.textContent).toContain(
      'Showing 1 of 2 products',
    );

    const activeChip = compiled.querySelector('.categories__chip[aria-current="true"]');
    expect(activeChip?.textContent?.trim()).toBe('testing');
  });

  it('shows a filter-specific empty state when the selected category matches nothing', async () => {
    const fixture = TestBed.createComponent(ProductOverview);
    fixture.componentRef.setInput('category', 'nonexistent');
    fixture.detectChanges();

    httpMock.expectOne(API_URL).flush([product, otherProduct]);
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="status"]')?.textContent).toContain(
      'No products in this category',
    );
    expect(compiled.querySelector('a[href="/products"]')).not.toBeNull();
  });
});
