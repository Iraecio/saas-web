import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppStateService } from '../../../../core/services/app-state';

@Component({
  selector: 'app-settings-general',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex flex-col">
      <div class="px-6 pt-6 pb-0">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Configurações</h1>
        <p class="mt-1 text-sm text-neutral-500">Preferências e informações da sua conta.</p>

        <nav class="mt-6 flex gap-1 border-b border-neutral-200 dark:border-neutral-700">
          <a
            routerLink="geral"
            routerLinkActive="border-b-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold"
            class="px-4 pb-3 text-sm text-neutral-500 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Geral
          </a>
          <a
            routerLink="perfil"
            routerLinkActive="border-b-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold"
            class="px-4 pb-3 text-sm text-neutral-500 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Meu Perfil
          </a>
          @if (appState.userRole() === 'CLIENT') {
            <a
              routerLink="pronuncias"
              routerLinkActive="border-b-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold"
              class="px-4 pb-3 text-sm text-neutral-500 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Pronúncias
            </a>
          }
        </nav>
      </div>

      <router-outlet />
    </div>
  `,
})
export class SettingsGeneralComponent {
  protected readonly appState = inject(AppStateService);
}
