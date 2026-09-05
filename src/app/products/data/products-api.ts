import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { injectMutation, injectQuery, injectQueryClient } from '@ngneat/query';
import { map } from 'rxjs';
import { NewProduct, Product } from './product';

export const API_URL = 'https://fakestoreapi.com/products';
export const PRODUCTS_QUERY_KEY = ['products'] as const;
export const productQueryKey = (id: number) => ['products', id] as const;

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  #http = inject(HttpClient);
  #query = injectQuery();
  #mutation = injectMutation();
  #queryClient = injectQueryClient();

  products() {
    return this.#query({
      queryKey: PRODUCTS_QUERY_KEY,
      queryFn: () => this.#http.get<Product[]>(API_URL),
      staleTime: Infinity,
    });
  }

  product(id: number) {
    return this.#query({
      queryKey: productQueryKey(id),
      queryFn: () => this.#http.get<Product>(`${API_URL}/${id}`),
      staleTime: Infinity,
    });
  }

  createProduct() {
    return this.#mutation({
      mutationFn: (product: NewProduct) =>
        this.#http
          .post<Product>(API_URL, product)
          .pipe(map((created) => ({ ...created, rating: created.rating ?? product.rating }))),
      onSuccess: (created) => {
        this.#queryClient.setQueryData<Product[]>(PRODUCTS_QUERY_KEY, (old) =>
          old ? [created, ...old] : old,
        );
        this.#queryClient.setQueryData(productQueryKey(created.id), created);
      },
    });
  }
}
