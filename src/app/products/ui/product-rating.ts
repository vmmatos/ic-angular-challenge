import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-product-rating',
  templateUrl: './product-rating.html',
  styleUrl: './product-rating.scss',
})
export class ProductRating {
  rate = input.required<number>();
  count = input.required<number>();

  percent = computed(() => Math.min(100, Math.max(0, (this.rate() / 5) * 100)));

  label = computed(() =>
    this.count() === 0
      ? 'No reviews yet'
      : `Rated ${this.rate()} out of 5 from ${this.count()} reviews`,
  );
}
