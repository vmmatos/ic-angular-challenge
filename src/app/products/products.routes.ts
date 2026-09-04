import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./overview/product-overview').then((m) => m.ProductOverview),
  },
  {
    path: 'new',
    loadComponent: () => import('./create/product-create').then((m) => m.ProductCreate),
  },
  {
    path: ':id',
    loadComponent: () => import('./detail/product-detail').then((m) => m.ProductDetail),
  },
];
