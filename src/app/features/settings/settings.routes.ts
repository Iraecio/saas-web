import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/general/general').then((m) => m.SettingsGeneralComponent),
  },
];
