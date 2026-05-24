import { Routes } from '@angular/router';

export const WALLET_ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'wallets',
    pathMatch: 'full',
  },
  {
    path: 'wallets',
    loadComponent: () =>
      import('./pages/wallets/wallets').then((m) => m.WalletsListPage),
  },
  {
    path: 'wallets/:userId',
    loadComponent: () =>
      import('./pages/wallet-detail/wallet-detail').then((m) => m.WalletDetailAdminPage),
  },
  {
    path: 'credits',
    loadComponent: () =>
      import('./pages/credits/credits').then((m) => m.CreditsSearchPage),
  },
  {
    path: 'disputes',
    loadComponent: () =>
      import('./pages/disputes/disputes').then((m) => m.DisputesAdminPage),
  },
  {
    path: 'refunds',
    loadComponent: () =>
      import('./pages/refunds/refunds').then((m) => m.RefundsAdminPage),
  },
  {
    path: 'reconciliation',
    loadComponent: () =>
      import('./pages/reconciliation/reconciliation').then((m) => m.ReconciliationPage),
  },
  {
    path: 'audit',
    loadComponent: () =>
      import('./pages/audit-log/audit-log').then((m) => m.AuditLogPage),
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./pages/analytics/analytics').then((m) => m.AnalyticsPage),
  },
  {
    path: 'issue-credits',
    loadComponent: () =>
      import('./pages/issue-credits/issue-credits').then((m) => m.IssueCreditsPage),
    data: { roles: ['SUPER_ADMIN'] },
  },
];
