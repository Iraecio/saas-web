import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard-redirect/dashboard-redirect').then((m) => m.DashboardRedirectComponent),
  },
  {
    path: 'admin',
    canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
  },
  {
    path: 'reseller',
    canActivate: [roleGuard(['RESELLER', 'RESELLER_MANAGER'])],
    loadComponent: () =>
      import('./pages/reseller-dashboard/reseller-dashboard').then((m) => m.ResellerDashboardComponent),
  },
  {
    path: 'voice-actor',
    canActivate: [roleGuard(['VOICE_ACTOR'])],
    loadComponent: () =>
      import('./pages/voice-actor-dashboard/voice-actor-dashboard').then((m) => m.VoiceActorDashboardComponent),
  },
  {
    path: 'producer',
    canActivate: [roleGuard(['PRODUCER'])],
    loadComponent: () =>
      import('./pages/producer-dashboard/producer-dashboard').then((m) => m.ProducerDashboardComponent),
  },
  {
    path: 'client',
    canActivate: [roleGuard(['CLIENT'])],
    loadComponent: () =>
      import('./pages/client-dashboard/client-dashboard').then((m) => m.ClientDashboardComponent),
  },
];
