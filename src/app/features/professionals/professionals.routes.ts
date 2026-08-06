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
    loadComponent: () => import('./pages/list/list').then((m) => m.ProfessionalsListPage),
  },
];
