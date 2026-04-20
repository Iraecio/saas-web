import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from '../../../core/services/app-state';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6 dark:border-neutral-700 dark:bg-neutral-800">
      <button
        type="button"
        class="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
        (click)="toggleSidebar.emit()"
        aria-label="Alternar sidebar"
      >
        ☰
      </button>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
          (click)="appState.toggleTheme()"
          [attr.aria-label]="appState.theme() === 'dark' ? 'Tema claro' : 'Tema escuro'"
        >
          {{ appState.theme() === 'dark' ? '☀️' : '🌙' }}
        </button>

        @if (appState.user(); as user) {
          <div class="flex items-center gap-3 border-l border-neutral-200 pl-3 dark:border-neutral-700">
            <div class="text-right">
              <p class="text-sm font-medium text-neutral-900 dark:text-white">{{ user.name }}</p>
              <p class="text-xs text-neutral-500">{{ user.role }}</p>
            </div>
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
              (click)="handleLogout()"
            >
              Sair
            </button>
          </div>
        }
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected readonly appState = inject(AppStateService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly toggleSidebar = output<void>();

  handleLogout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
