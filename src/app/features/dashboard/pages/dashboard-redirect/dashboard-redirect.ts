import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from '../../../../core/services/app-state';
import { UserRole } from '../../../../core/models/user.model';

const ROLE_DASHBOARD: Record<UserRole, string> = {
  SUPER_ADMIN: '/admin/dashboard/admin',
  ADMIN: '/admin/dashboard/admin',
  RESELLER: '/admin/dashboard/reseller',
  RESELLER_MANAGER: '/admin/dashboard/reseller',
  VOICE_ACTOR: '/admin/dashboard/voice-actor',
  PRODUCER: '/admin/dashboard/producer',
  CLIENT: '/admin/dashboard/client',
};

@Component({
  selector: 'app-dashboard-redirect',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class DashboardRedirectComponent implements OnInit {
  private readonly appState = inject(AppStateService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const user = this.appState.user();

    if (!user) {
      console.warn('[DashboardRedirect] No user found, redirecting to login');
      this.router.navigate(['/auth/login']);
      return;
    }

    const route = ROLE_DASHBOARD[user.role] ?? '/admin/dashboard/client';
    console.log(`[DashboardRedirect] User role: ${user.role}, redirecting to: ${route}`);
    this.router.navigate([route]);
  }
}
