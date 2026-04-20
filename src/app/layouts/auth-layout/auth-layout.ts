import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div class="w-full max-w-md p-6">
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">SaaS Web</h1>
          <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Painel administrativo</p>
        </div>
        <router-outlet />
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
