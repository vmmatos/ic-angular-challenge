import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideQueryClient, QueryClient } from '@ngneat/query';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { vi } from 'vitest';
import { ProductsApi } from './products-api';
import { NewProduct, Product } from './product';

const API_URL = 'https://fakestoreapi.com/products';

const product: Product = {
  id: 1,
  title: 'Test product',
  price: 9.99,
  description: 'A product used in tests',
  category: 'testing',
  image: 'https://example.com/image.png',
  rating: { rate: 4.5, count: 10 },
};

const newProduct: NewProduct = {
  title: product.title,
  price: product.price,
  description: product.description,
  category: product.category,
  image: product.image,
  rating: product.rating,
};

describe('ProductsApi', () => {
  let api: ProductsApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideQueryClient(
          () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
        ),
      ],
    });
    api = TestBed.inject(ProductsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('products() resolves with the product list', async () => {
    const settled = firstValueFrom(
      api.products().result$.pipe(filter((r) => r.isSuccess || r.isError)),
    );

    httpMock.expectOne(API_URL).flush([product]);

    const result = await settled;
    expect(result.isSuccess).toBe(true);
    expect(result.data).toEqual([product]);
  });

  it('products() surfaces a failed request', async () => {
    const settled = firstValueFrom(
      api.products().result$.pipe(filter((r) => r.isSuccess || r.isError)),
    );

    httpMock.expectOne(API_URL).flush('failure', { status: 500, statusText: 'Server Error' });

    const result = await settled;
    expect(result.isError).toBe(true);
  });

  it('product(id) resolves with a single product', async () => {
    const settled = firstValueFrom(
      api.product(1).result$.pipe(filter((r) => r.isSuccess || r.isError)),
    );

    httpMock.expectOne(`${API_URL}/1`).flush(product);

    const result = await settled;
    expect(result.isSuccess).toBe(true);
    expect(result.data).toEqual(product);
  });

  it('createProduct() posts the new product and resolves', async () => {
    const { mutateAsync } = api.createProduct();
    const created = mutateAsync(newProduct);

    const req = await vi.waitFor(() => httpMock.expectOne(API_URL));
    req.flush(product);

    await expect(created).resolves.toEqual(product);
  });

  it('createProduct() surfaces a failed request', async () => {
    const { mutateAsync } = api.createProduct();
    const created = mutateAsync(newProduct);

    const req = await vi.waitFor(() => httpMock.expectOne(API_URL));
    req.flush('failure', { status: 500, statusText: 'Server Error' });

    await expect(created).rejects.toBeTruthy();
  });
});
