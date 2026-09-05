import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsApi } from '../data/products-api';
import { truncate } from './truncate';

const DESCRIPTION_LIMIT = 110;

@Component({
  selector: 'app-product-overview',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './product-overview.html',
  styleUrl: './product-overview.scss',
})
export class ProductOverview {
  #productsApi = inject(ProductsApi);
  #query = this.#productsApi.products();

  result = this.#query.result;

  cards = computed(() =>
    (this.result().data ?? []).map((product) => ({
      ...product,
      shortDescription: truncate(product.description, DESCRIPTION_LIMIT),
    })),
  );

  retry(): void {
    this.result().refetch();
  }
}
