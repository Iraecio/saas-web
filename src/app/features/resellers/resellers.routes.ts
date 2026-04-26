import { Routes } from '@angular/router';

export const RESELLERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/list/resellers-list').then((m) => m.ResellersListComponent),
  },
];
