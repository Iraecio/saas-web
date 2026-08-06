import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const PROFESSIONALS_ROUTES: Routes = [
  {
    path: 'my-services',
    canActivate: [roleGuard(['VOICE_ACTOR'])],
    loadComponent: () => import('./pages/my-services/my-services').then((m) => m.MyServicesPage),
  },
  {
    path: '',
    canActivate: [roleGuard(['SUPER_ADMIN'])],
    loadComponent: () =>
      import('./pages/admin-list/admin-list').then((m) => m.ProfessionalAdminListPage),
  },
  {
    path: ':userId',
    canActivate: [roleGuard(['SUPER_ADMIN'])],
    loadComponent: () =>
      import('./pages/admin-detail/admin-detail').then((m) => m.ProfessionalAdminDetailPage),
  },
];
