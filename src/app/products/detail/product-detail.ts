import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ErrorPage } from '../../error/error-page';
import { ProductsApi } from '../data/products-api';

function parseId(raw: string | null): number | null {
  const id = Number(raw);
  return raw !== null && Number.isInteger(id) && id > 0 ? id : null;
}

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, RouterLink, ErrorPage],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  #productsApi = inject(ProductsApi);
  #id = parseId(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  #query = this.#id !== null ? this.#productsApi.product(this.#id) : null;

  result = this.#query?.result;

  pending = computed(() => this.result?.().isPending ?? false);

  product = computed(() => this.result?.().data ?? null);

  notFound = computed(() => {
    if (this.#id === null) {
      return true;
    }

    const r = this.result!();
    if (r.isPending) {
      return false;
    }

    return r.isError || !r.data;
  });
}
