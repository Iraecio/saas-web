import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.RegisterComponent),
  },
  {
    path: 'bootstrap',
    loadComponent: () => import('./pages/bootstrap/bootstrap').then((m) => m.BootstrapComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
