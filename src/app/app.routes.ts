import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout').then((m) => m.AuthLayoutComponent),
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
      {
        path: 'role-requests',
        loadChildren: () =>
          import('./features/role-requests/role-requests.routes').then((m) => m.ROLE_REQUESTS_ROUTES),
      },
      {
        path: 'resellers',
        loadChildren: () =>
          import('./features/resellers/resellers.routes').then((m) => m.RESELLERS_ROUTES),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
      },
      {
        path: 'custom-domains',
        canActivate: [roleGuard(['RESELLER', 'RESELLER_MANAGER', 'ADMIN', 'SUPER_ADMIN'])],
        loadChildren: () =>
          import('./features/custom-domains/custom-domains.routes').then(
            (m) => m.CUSTOM_DOMAINS_ROUTES,
          ),
      },
      {
        path: 'wallet',
        loadChildren: () =>
          import('./features/wallet/wallet.routes').then((m) => m.WALLET_ROUTES),
      },
      {
        path: 'wallet-admin',
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])],
        loadChildren: () =>
          import('./features/wallet-admin/wallet-admin.routes').then(
            (m) => m.WALLET_ADMIN_ROUTES,
          ),
      },
      {
        path: 'storage',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        loadChildren: () =>
          import('./features/storage/storage.routes').then((m) => m.STORAGE_ROUTES),
      },
      {
        path: 'services',
        canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN', 'RESELLER', 'RESELLER_MANAGER'])],
        loadChildren: () =>
          import('./features/services/services.routes').then((m) => m.SERVICES_ROUTES),
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./features/orders/orders.routes').then((m) => m.ORDERS_ROUTES),
      },
      {
        path: 'professionals',
        loadChildren: () =>
          import('./features/professionals/professionals.routes').then(
            (m) => m.PROFESSIONALS_ROUTES,
          ),
      },
      {
        path: 'withdrawals',
        canActivate: [roleGuard(['VOICE_ACTOR', 'PRODUCER', 'ADMIN', 'SUPER_ADMIN'])],
        loadChildren: () =>
          import('./features/withdrawals/withdrawals.routes').then((m) => m.WITHDRAWALS_ROUTES),
      },
      {
        path: 'reseller-credits',
        canActivate: [roleGuard(['RESELLER', 'RESELLER_MANAGER', 'ADMIN', 'SUPER_ADMIN'])],
        loadChildren: () =>
          import('./features/reseller-credits/reseller-credits.routes').then(
            (m) => m.RESELLER_CREDITS_ROUTES,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/admin/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/admin/dashboard' },
];
