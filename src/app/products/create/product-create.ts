import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductsApi } from '../data/products-api';
import { NewProduct } from '../data/product';

type FieldName = 'title' | 'price' | 'description' | 'category' | 'image';

const FIELD_LABELS: Record<FieldName, string> = {
  title: 'Title',
  price: 'Price',
  description: 'Description',
  category: 'Category',
  image: 'Image URL',
};

const IMAGE_URL_PATTERN = /^https?:\/\/.+\..+/i;

@Component({
  selector: 'app-product-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-create.html',
  styleUrl: './product-create.scss',
})
export class ProductCreate {
  #productsApi = inject(ProductsApi);
  #mutation = this.#productsApi.createProduct();

  protected form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)],
    }),
    category: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    image: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(IMAGE_URL_PATTERN)],
    }),
  });

  protected submitted = signal(false);
  protected result = this.#mutation.result;
  protected submitting = computed(() => this.result().isPending);

  protected fieldInvalid(name: FieldName): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected fieldErrorMessage(name: FieldName): string | null {
    if (!this.fieldInvalid(name)) {
      return null;
    }

    const errors = this.form.controls[name].errors ?? {};
    const label = FIELD_LABELS[name];

    if (errors['required']) {
      return `${label} is required.`;
    }
    if (errors['minlength']) {
      return `${label} must be at least ${errors['minlength'].requiredLength} characters.`;
    }
    if (errors['min']) {
      return 'Price must be greater than 0.';
    }
    if (errors['pattern']) {
      return 'Enter a valid image URL (starting with http:// or https://).';
    }
    return null;
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const newProduct: NewProduct = {
      title: value.title,
      price: value.price!,
      description: value.description,
      category: value.category,
      image: value.image,
      rating: { rate: 0, count: 0 },
    };

    try {
      await this.#mutation.mutateAsync(newProduct);
      this.form.reset();
      this.submitted.set(false);
    } catch {
      // surfaced via result().isError in the template
    }
  }
}
