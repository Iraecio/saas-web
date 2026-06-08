import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const WITHDRAWALS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/my-withdrawals/my-withdrawals').then((m) => m.MyWithdrawalsPage),
  },
  {
    path: 'admin',
    canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
    loadComponent: () =>
      import('./pages/admin-withdrawals/admin-withdrawals').then((m) => m.AdminWithdrawalsPage),
  },
];
