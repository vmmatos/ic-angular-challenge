import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { injectMutation, injectQuery } from '@ngneat/query';
import { NewProduct, Product } from './product';

const API_URL = 'https://fakestoreapi.com/products';

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  #http = inject(HttpClient);
  #query = injectQuery();
  #mutation = injectMutation();

  products() {
    return this.#query({
      queryKey: ['products'] as const,
      queryFn: () => this.#http.get<Product[]>(API_URL),
    });
  }

  product(id: number) {
    return this.#query({
      queryKey: ['products', id] as const,
      queryFn: () => this.#http.get<Product>(`${API_URL}/${id}`),
    });
  }

  createProduct() {
    return this.#mutation({
      mutationFn: (product: NewProduct) => this.#http.post<Product>(API_URL, product),
    });
  }
}
