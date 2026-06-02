import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'auth/reset-password',                 renderMode: RenderMode.Server },
  { path: 'admin/users/:id/edit',               renderMode: RenderMode.Server },
  { path: 'admin/users/:id/permissions',        renderMode: RenderMode.Server },
  { path: 'admin/custom-domains/:resellerId',   renderMode: RenderMode.Server },
  { path: 'admin/wallet/credits/:id',           renderMode: RenderMode.Server },
  { path: 'admin/wallet-admin/wallets/:userId', renderMode: RenderMode.Server },
  { path: '**',                                 renderMode: RenderMode.Prerender },
];
