import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const ORDERS_ROUTES: Routes = [
  {
    path: 'manage',
    canActivate: [roleGuard(['SUPER_ADMIN'])],
    loadComponent: () => import('./pages/admin-list/admin-list').then((m) => m.OrderAdminListPage),
  },
  {
    path: 'manage/:id',
    canActivate: [roleGuard(['SUPER_ADMIN'])],
    loadComponent: () =>
      import('./pages/admin-detail/admin-detail').then((m) => m.OrderAdminDetailPage),
  },
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
