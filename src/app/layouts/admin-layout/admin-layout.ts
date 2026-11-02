import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppStateService } from '../../core/services/app-state';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../shared/components/header/header';
import { ImpersonationBannerComponent } from '../../shared/components/impersonation-banner/impersonation-banner';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ImpersonationBannerComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-canvas text-foreground">
      <app-sidebar [open]="appState.sidebarOpen()" />

      <div class="flex flex-1 flex-col overflow-hidden">
        <app-header (toggleSidebar)="appState.toggleSidebar()" />
        <app-impersonation-banner />

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
