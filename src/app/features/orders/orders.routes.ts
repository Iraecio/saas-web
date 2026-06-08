import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/list/list').then((m) => m.OrdersListPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/create/create').then((m) => m.OrderCreatePage),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/detail/detail').then((m) => m.OrderDetailPage),
  },
];
