import { Routes } from '@angular/router';

export const STORAGE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/file-manager/file-manager').then((m) => m.FileManagerPage),
  },
];
