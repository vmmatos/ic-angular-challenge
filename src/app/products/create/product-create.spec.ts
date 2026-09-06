import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideQueryClient, QueryClient } from '@ngneat/query';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { ProductCreate } from './product-create';
import { API_URL } from '../data/products-api';
import { Product } from '../data/product';

const createdProduct: Product = {
  id: 11,
  title: 'New product',
  price: 19.99,
  description: 'A brand new product',
  category: 'electronics',
  image: 'https://example.com/new-image.png',
  rating: { rate: 0, count: 0 },
};

function fillValidForm(compiled: HTMLElement): void {
  setValue(compiled, 'title', 'New product');
  setValue(compiled, 'price', '19.99');
  setValue(compiled, 'description', 'A brand new product description');
  setValue(compiled, 'category', 'electronics');
  setValue(compiled, 'image', 'https://example.com/new-image.png');
}

function setValue(compiled: HTMLElement, id: string, value: string): void {
  const el = compiled.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
  el.value = value;
  el.dispatchEvent(new Event('input'));
}

function submitForm(fixture: ComponentFixture<ProductCreate>): void {
  const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
  form.dispatchEvent(new Event('submit'));
  fixture.detectChanges();
}

describe('ProductCreate', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCreate],
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

  it('renders a labeled input for each field', () => {
    const fixture = TestBed.createComponent(ProductCreate);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    for (const id of ['title', 'price', 'description', 'category', 'image']) {
      const label = compiled.querySelector(`label[for="${id}"]`);
      const field = compiled.querySelector(`#${id}`);
      expect(label).toBeTruthy();
      expect(field).toBeTruthy();
    }
  });

  it('shows a validation error per required field on empty submit and makes no request', () => {
    const fixture = TestBed.createComponent(ProductCreate);
    fixture.detectChanges();

    submitForm(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    for (const id of ['title', 'price', 'description', 'category', 'image']) {
      expect(compiled.querySelector(`#${id}-error`)).toBeTruthy();
    }
  });

  it('shows a minlength error for a too-short title', () => {
    const fixture = TestBed.createComponent(ProductCreate);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    setValue(compiled, 'title', 'ab');
    submitForm(fixture);

    expect(compiled.querySelector('#title-error')?.textContent).toContain('at least');
  });

  it('shows a min error for a non-positive price', () => {
    const fixture = TestBed.createComponent(ProductCreate);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    setValue(compiled, 'price', '-1');
    submitForm(fixture);

    expect(compiled.querySelector('#price-error')?.textContent).toContain('greater than 0');
  });

  it('shows a pattern error for an invalid image URL', () => {
    const fixture = TestBed.createComponent(ProductCreate);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    setValue(compiled, 'image', 'not-a-url');
    submitForm(fixture);

    expect(compiled.querySelector('#image-error')?.textContent).toContain('valid image URL');
  });

  it('links each invalid field to its error message via aria-describedby', () => {
    const fixture = TestBed.createComponent(ProductCreate);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    submitForm(fixture);

    const titleInput = compiled.querySelector<HTMLInputElement>('#title')!;
    const describedById = titleInput.getAttribute('aria-describedby');
    expect(describedById).toBe('title-error');
    expect(compiled.querySelector(`#${describedById}`)?.textContent).toBeTruthy();
  });

  it('submits a valid form, shows success feedback, and resets the form', async () => {
    const fixture = TestBed.createComponent(ProductCreate);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    fillValidForm(compiled);
    submitForm(fixture);

    const submitButton = compiled.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(submitButton.disabled).toBe(true);
    });

    const req = await vi.waitFor(() => httpMock.expectOne(API_URL));
    expect(req.request.body).toEqual({
      title: 'New product',
      price: 19.99,
      description: 'A brand new product description',
      category: 'electronics',
      image: 'https://example.com/new-image.png',
      rating: { rate: 0, count: 0 },
    });

    req.flush(createdProduct);
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="status"]')).toBeTruthy();
    });

    expect(compiled.querySelector('[role="status"]')?.textContent).toContain('New product');
    expect(compiled.querySelector('.state__note')?.textContent).toContain("doesn't persist");
    expect(submitButton.disabled).toBe(false);
    expect(compiled.querySelector<HTMLInputElement>('#title')?.value).toBe('');
  });

  it('shows an error state and preserves entered values on a failed request', async () => {
    const fixture = TestBed.createComponent(ProductCreate);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    fillValidForm(compiled);
    submitForm(fixture);

    const req = await vi.waitFor(() => httpMock.expectOne(API_URL));
    req.flush('failure', { status: 500, statusText: 'Server Error' });

    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    });

    expect(compiled.querySelector('[role="alert"]')?.textContent).toContain(
      "couldn't create the product",
    );
    expect(compiled.querySelector<HTMLInputElement>('#title')?.value).toBe('New product');

    const submitButton = compiled.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(submitButton.disabled).toBe(false);
  });
});
