import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideQueryClient, QueryClient } from '@ngneat/query';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { ComponentFixture } from '@angular/core/testing';
import { vi } from 'vitest';
import { ProductDetail } from './product-detail';
import { API_URL } from '../data/products-api';
import { Product } from '../data/product';

async function settle(fixture: ComponentFixture<ProductDetail>): Promise<void> {
  await vi.waitFor(() => {
    fixture.detectChanges();
    expect(fixture.componentInstance.pending()).toBe(false);
  });
  fixture.detectChanges();
}

const product: Product = {
  id: 1,
  title: 'Test product',
  price: 9.99,
  description: 'A full product description used in tests',
  category: 'testing',
  image: 'https://example.com/image.png',
  rating: { rate: 4.5, count: 10 },
};

function configureTestingModule(id: string): void {
  TestBed.configureTestingModule({
    imports: [ProductDetail],
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      provideQueryClient(() => new QueryClient({ defaultOptions: { queries: { retry: false } } })),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ id }) } },
      },
    ],
  });
}

describe('ProductDetail', () => {
  let httpMock: HttpTestingController;

  afterEach(() => httpMock.verify());

  it('shows a loading state before the request resolves', async () => {
    configureTestingModule('1');
    httpMock = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(ProductDetail);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="status"]')?.textContent).toContain('Loading product');
    expect(compiled.querySelectorAll('.skeleton').length).toBeGreaterThan(0);

    httpMock.expectOne(`${API_URL}/1`).flush(product);
    await settle(fixture);

    expect(compiled.querySelectorAll('.skeleton').length).toBe(0);
  });

  it('renders the full product info and a link back to the overview', async () => {
    configureTestingModule('1');
    httpMock = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(ProductDetail);
    fixture.detectChanges();

    httpMock.expectOne(`${API_URL}/1`).flush(product);
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain(product.title);
    expect(compiled.querySelector('.detail__category')?.textContent).toContain(product.category);
    expect(compiled.querySelector('.detail__description')?.textContent).toBe(product.description);
    expect(compiled.querySelector('.detail__price')?.textContent).toContain('9.99');
    expect(compiled.querySelector('.detail__rating')?.textContent).toContain('4.5');
    expect(compiled.querySelector('.detail__rating')?.textContent).toContain('10');

    const image = compiled.querySelector<HTMLImageElement>('.detail__image');
    expect(image?.alt).toBe(product.title);
    expect(image?.src).toBe(product.image);

    const backLinks = compiled.querySelectorAll('a[href="/products"]');
    expect(backLinks.length).toBeGreaterThan(0);
  });

  it('shows a not-found state when the product does not exist', async () => {
    configureTestingModule('999999');
    httpMock = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(ProductDetail);
    fixture.detectChanges();

    httpMock.expectOne(`${API_URL}/999999`).flush(null as unknown as Product);
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const alert = compiled.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Product not found');
    expect(compiled.querySelector('a[href="/products"]')).not.toBeNull();
  });

  it('shows a not-found state when the request fails', async () => {
    configureTestingModule('1');
    httpMock = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(ProductDetail);
    fixture.detectChanges();

    httpMock
      .expectOne(`${API_URL}/1`)
      .flush('failure', { status: 500, statusText: 'Server Error' });
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="alert"]')?.textContent).toContain('Product not found');
  });

  it('shows a not-found state for an invalid id without calling the API', async () => {
    configureTestingModule('abc');
    httpMock = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(ProductDetail);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="alert"]')?.textContent).toContain('Product not found');
  });
});
