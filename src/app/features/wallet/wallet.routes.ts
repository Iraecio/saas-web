import { Routes } from '@angular/router';

export const WALLET_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/balance/balance').then((m) => m.WalletBalancePage),
  },
  {
    path: 'credits',
    loadComponent: () =>
      import('./pages/credits/credits').then((m) => m.CreditsListPage),
  },
  {
    path: 'credits/:id',
    loadComponent: () =>
      import('./pages/credit-detail/credit-detail').then((m) => m.CreditDetailPage),
  },
  {
    path: 'refunds',
    loadComponent: () =>
      import('./pages/refunds/refunds').then((m) => m.RefundsListPage),
  },
];
