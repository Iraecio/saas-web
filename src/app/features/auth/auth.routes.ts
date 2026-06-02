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
  {
    path: 'register-reseller',
    loadComponent: () =>
      import('./pages/register-reseller/register-reseller').then(
        (m) => m.RegisterResellerComponent,
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password').then((m) => m.ResetPasswordComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
