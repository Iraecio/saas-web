import { Routes } from '@angular/router';

export const CUSTOM_DOMAINS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list/list').then((m) => m.CustomDomainsListComponent),
  },
  {
    path: ':resellerId',
    loadComponent: () =>
      import('./pages/list/list').then((m) => m.CustomDomainsListComponent),
  },
];
