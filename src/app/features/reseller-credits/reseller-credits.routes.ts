import { Routes } from '@angular/router';

export const RESELLER_CREDITS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/emissions/emissions').then((m) => m.EmissionsReportPage),
  },
  {
    path: 'emit',
    loadComponent: () => import('./pages/emit/emit').then((m) => m.EmitCreditPage),
  },
];
