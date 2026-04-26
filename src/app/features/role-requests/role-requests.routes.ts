import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const ROLE_REQUESTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    loadComponent: () =>
      import('./pages/admin-list/role-requests-admin').then((m) => m.RoleRequestsAdminComponent),
  },
  {
    path: 'new',
    canActivate: [roleGuard(['CLIENT'])],
    loadComponent: () =>
      import('./pages/role-request-form/role-request-form').then((m) => m.RoleRequestFormComponent),
  },
  {
    path: 'my',
    canActivate: [roleGuard(['CLIENT'])],
    loadComponent: () =>
      import('./pages/my-requests/my-requests').then((m) => m.MyRequestsComponent),
  },
];
