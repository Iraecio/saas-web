import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/overview/overview').then((m) => m.ProfileOverviewComponent),
  },
  {
    path: 'voice',
    loadComponent: () =>
      import('./pages/voice-profile/voice-profile').then((m) => m.VoiceProfilePageComponent),
  },
  {
    path: 'producer',
    loadComponent: () =>
      import('./pages/producer-profile/producer-profile').then(
        (m) => m.ProducerProfilePageComponent,
      ),
  },
  {
    path: 'client',
    loadComponent: () =>
      import('./pages/client-profile/client-profile').then((m) => m.ClientProfilePageComponent),
  },
  {
    path: 'pronunciations',
    redirectTo: '/admin/settings/pronuncias',
  },
];
