import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { injectMutation, injectQuery } from '@ngneat/query';
import { NewProduct, Product } from './product';

export const API_URL = 'https://fakestoreapi.com/products';
export const PRODUCTS_QUERY_KEY = ['products'] as const;
export const productQueryKey = (id: number) => ['products', id] as const;

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  #http = inject(HttpClient);
  #query = injectQuery();
  #mutation = injectMutation();

  products() {
    return this.#query({
      queryKey: PRODUCTS_QUERY_KEY,
      queryFn: () => this.#http.get<Product[]>(API_URL),
    });
  }

  product(id: number) {
    return this.#query({
      queryKey: productQueryKey(id),
      queryFn: () => this.#http.get<Product>(`${API_URL}/${id}`),
    });
  }

  createProduct() {
    return this.#mutation({
      mutationFn: (product: NewProduct) => this.#http.post<Product>(API_URL, product),
    });
  }
}
