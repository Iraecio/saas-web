import { Routes } from '@angular/router';

export const SERVICES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/list/list').then((m) => m.ServicesListPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/form/form').then((m) => m.ServiceFormPage),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/form/form').then((m) => m.ServiceFormPage),
  },
  {
    path: ':id/audit',
    loadComponent: () => import('./pages/audit/audit').then((m) => m.ServiceAuditPage),
  },
];
