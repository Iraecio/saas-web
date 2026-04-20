import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppStateService } from '../../core/services/app-state';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../shared/components/header/header';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-900">
      <app-sidebar [open]="appState.sidebarOpen()" />

      <div class="flex flex-1 flex-col overflow-hidden">
        <app-header (toggleSidebar)="appState.toggleSidebar()" />

        <main class="flex-1 overflow-y-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  protected readonly appState = inject(AppStateService);
}
