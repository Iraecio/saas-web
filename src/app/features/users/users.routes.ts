import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/list/users-list').then((m) => m.UsersListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/form/users-form').then((m) => m.UsersFormComponent),
  },
];
