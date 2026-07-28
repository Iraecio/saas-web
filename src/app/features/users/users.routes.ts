import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/list/users-list').then((m) => m.UsersListComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/edit/user-edit').then((m) => m.UserEditComponent),
  },
  {
    path: ':id/permissions',
    loadComponent: () =>
      import('./pages/permissions/permissions').then((m) => m.PermissionsPageComponent),
  },
];
