import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'auth/reset-password', renderMode: RenderMode.Server },
  // Rotas autenticadas dependem de tokens armazenados no navegador. Renderizar
  // essas páginas no servidor faria os guards interpretarem a ausência de
  // localStorage como logout durante um F5.
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];
