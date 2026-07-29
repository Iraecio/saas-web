import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/general/general').then((m) => m.SettingsGeneralComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'geral' },
      {
        path: 'geral',
        loadComponent: () =>
          import('./pages/appearance/appearance').then((m) => m.SettingsAppearanceComponent),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('../profile/pages/overview/overview').then((m) => m.ProfileOverviewComponent),
      },
      {
        path: 'pronuncias',
        canActivate: [roleGuard(['CLIENT'])],
        loadComponent: () =>
          import('../pronunciations/pages/library/library').then((m) => m.PronunciationLibraryPage),
      },
      {
        path: 'pagamento',
        canActivate: [roleGuard(['SUPER_ADMIN', 'RESELLER', 'RESELLER_MANAGER'])],
        loadComponent: () => import('./pages/payment/payment').then((m) => m.PaymentSettingsPage),
      },
      {
        path: 'ui-kit',
        loadComponent: () => import('./pages/ui-kit/ui-kit').then((m) => m.UiKitComponent),
      },
    ],
  },
];
