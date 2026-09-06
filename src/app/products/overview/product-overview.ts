import { Component, computed, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsApi } from '../data/products-api';
import { ProductRating } from '../ui/product-rating';
import { truncate } from './truncate';

const DESCRIPTION_LIMIT = 110;

@Component({
  selector: 'app-product-overview',
  imports: [CurrencyPipe, RouterLink, ProductRating],
  templateUrl: './product-overview.html',
  styleUrl: './product-overview.scss',
})
export class ProductOverview {
  #productsApi = inject(ProductsApi);
  #query = this.#productsApi.products();

  category = input('');

  result = this.#query.result;

  #products = computed(() => this.result().data ?? []);

  categories = computed(() => [...new Set(this.#products().map((p) => p.category))].sort());

  cards = computed(() => {
    const category = this.category();
    const products = category
      ? this.#products().filter((p) => p.category === category)
      : this.#products();

    return products.map((product) => ({
      ...product,
      shortDescription: truncate(product.description, DESCRIPTION_LIMIT),
    }));
  });

  total = computed(() => this.#products().length);

  retry(): void {
    this.result().refetch();
  }
}
