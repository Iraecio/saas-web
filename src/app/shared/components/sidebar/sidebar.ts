import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppStateService } from '../../../core/services/app-state';
import { UserRole } from '../../../core/models/user.model';
import { ImpersonationService } from '../../../core/services/impersonation';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

const MENU_BY_ROLE: Record<UserRole, MenuItem[]> = {
  SUPER_ADMIN: [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '👥', label: 'Usuários', route: '/admin/users' },
    { icon: '🎙️', label: 'Profissionais', route: '/admin/professionals' },
    { icon: '💼', label: 'Revendedores', route: '/admin/resellers' },
    { icon: '💰', label: 'Carteiras', route: '/admin/wallet-admin' },
    { icon: '🎯', label: 'Solicitações de Papel', route: '/admin/role-requests' },
    { icon: '📦', label: 'Gestão de Pedidos', route: '/admin/orders/manage' },
    { icon: '🛎️', label: 'Catálogo', route: '/admin/services' },
    { icon: '💸', label: 'Saques', route: '/admin/withdrawals/admin' },
    { icon: '🪙', label: 'Compras de Créditos', route: '/admin/reseller-credits/admin-purchases' },
    { icon: '📈', label: 'Relatórios', route: '/admin/reports' },
    { icon: '🗂️', label: 'Armazenamento', route: '/admin/storage' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ],
  ADMIN: [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '👥', label: 'Usuários', route: '/admin/users' },
    { icon: '🎯', label: 'Solicitações de Papel', route: '/admin/role-requests' },
    { icon: '📦', label: 'Pedidos', route: '/admin/orders' },
    { icon: '🛎️', label: 'Catálogo', route: '/admin/services' },
    { icon: '🎙️', label: 'Profissionais', route: '/admin/professionals' },
    { icon: '💸', label: 'Saques', route: '/admin/withdrawals/admin' },
    { icon: '🪙', label: 'Compras de Créditos', route: '/admin/reseller-credits/admin-purchases' },
    { icon: '💼', label: 'Revendedores', route: '/admin/resellers' },
    { icon: '📈', label: 'Relatórios', route: '/admin/reports' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ],
  RESELLER: [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '📦', label: 'Pedidos', route: '/admin/orders' },
    { icon: '🛎️', label: 'Catálogo', route: '/admin/services' },
    { icon: '🎙️', label: 'Profissionais', route: '/admin/professionals' },
    { icon: '🪙', label: 'Comprar Créditos', route: '/admin/reseller-credits/purchases' },
    { icon: '📦', label: 'Estoque', route: '/admin/reseller-credits/stock' },
    { icon: '💵', label: 'Vendas', route: '/admin/reseller-credits/sales' },
    { icon: '🏷️', label: 'Preços e pacotes', route: '/admin/reseller-credits/pricing' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ],
  RESELLER_MANAGER: [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '📦', label: 'Pedidos', route: '/admin/orders' },
    { icon: '🛎️', label: 'Catálogo', route: '/admin/services' },
    { icon: '🎙️', label: 'Profissionais', route: '/admin/professionals' },
    { icon: '🪙', label: 'Comprar Créditos', route: '/admin/reseller-credits/purchases' },
    { icon: '📦', label: 'Estoque', route: '/admin/reseller-credits/stock' },
    { icon: '💵', label: 'Vendas', route: '/admin/reseller-credits/sales' },
    { icon: '🏷️', label: 'Preços e pacotes', route: '/admin/reseller-credits/pricing' },
    { icon: '📈', label: 'Relatórios', route: '/admin/reports' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ],
  VOICE_ACTOR: [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '📦', label: 'Meus Pedidos', route: '/admin/orders' },
    { icon: '🎛️', label: 'Meus Serviços', route: '/admin/professionals/my-services' },
    { icon: '💸', label: 'Meus Saques', route: '/admin/withdrawals' },
    { icon: '💳', label: 'Minha Carteira', route: '/admin/wallet' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ],
  PRODUCER: [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '📦', label: 'Meus Pedidos', route: '/admin/orders' },
    { icon: '💸', label: 'Meus Saques', route: '/admin/withdrawals' },
    { icon: '💳', label: 'Minha Carteira', route: '/admin/wallet' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ],
  CLIENT: [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '➕', label: 'Novo Pedido', route: '/admin/orders/new' },
    { icon: '📦', label: 'Meus Pedidos', route: '/admin/orders' },
    { icon: '🎙️', label: 'Profissionais', route: '/admin/professionals' },
    { icon: '💳', label: 'Minha Carteira', route: '/admin/wallet' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ],
};

const DIRECT_CLIENT_MENU: MenuItem[] = [
  { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
  { icon: '➕', label: 'Novo Pedido', route: '/admin/orders/new' },
  { icon: '📦', label: 'Meus Pedidos', route: '/admin/orders' },
  { icon: '💳', label: 'Minha Carteira', route: '/admin/wallet' },
  { icon: '🎯', label: 'Solicitar Upgrade', route: '/admin/role-requests/new' },
  { icon: '📋', label: 'Minhas Solicitações', route: '/admin/role-requests/my' },
  { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
];

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="relative z-30 flex h-dvh shrink-0 flex-col border-r border-border bg-surface text-foreground shadow-[var(--ui-shadow-sm)] transition-[width] duration-300"
      [class]="widthClasses()"
    >
      <div class="flex h-[var(--ui-header-height)] items-center border-b border-border px-5">
        <h2 class="flex items-center gap-3 text-lg font-semibold tracking-tight text-foreground">
          <span
            class="grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-sm font-bold text-white shadow-[0_3px_8px_rgb(0_92_187/25%)]"
            >S</span
          >
          @if (open()) {
            <span>Studio SaaS</span>
          }
        </h2>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto px-4 py-5" aria-label="Navegação principal">
        @for (item of menuItems(); track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="sidebar-item-active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="sidebar-item"
          >
            <span class="grid size-6 shrink-0 place-items-center text-base grayscale-[.25]">{{
              item.icon
            }}</span>
            @if (open()) {
              <span class="truncate text-sm">{{ item.label }}</span>
              @if (item.badge) {
                <span
                  class="ml-auto rounded-sm bg-danger px-1.5 py-0.5 text-[10px] font-semibold text-white"
                >
                  {{ item.badge }}
                </span>
              }
            }
          </a>
        }
      </nav>

      <div class="border-t border-border p-4">
        @if (open()) {
          <div class="flex items-center gap-2">
            <div
              class="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-xs font-semibold text-brand"
            >
              {{ appState.userName()[0]?.toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-xs font-medium text-foreground">
                {{ appState.userName() }}
              </p>
              @if (roleLabel(); as label) {
                <p class="text-[11px] text-muted">{{ label }}</p>
              }
            </div>
          </div>
        } @else {
          <div class="flex justify-center">
            <div
              class="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-xs font-semibold text-brand"
            >
              {{ appState.userName()[0]?.toUpperCase() }}
            </div>
          </div>
        }
        <p class="mt-2 text-[10px] text-muted/70">{{ open() ? 'v0.1.0' : '' }}</p>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly open = input(true);
  protected readonly appState = inject(AppStateService);
  protected readonly inspection = inject(ImpersonationService);

  readonly widthClasses = computed(() =>
    this.open() ? 'w-[var(--ui-sidebar-width)]' : 'w-[var(--ui-sidebar-compact-width)]',
  );

  readonly menuItems = computed((): MenuItem[] => {
    const user = this.appState.user();
    if (!user?.role) return [];
    const role = this.inspection.effectiveRole() ?? user.role;
    if (role === 'CLIENT' && !user.resellerId) return DIRECT_CLIENT_MENU;
    return MENU_BY_ROLE[role] ?? [];
  });

  readonly roleLabel = computed((): string => {
    const labels: Record<UserRole, string> = {
      SUPER_ADMIN: 'Super Admin',
      ADMIN: 'Administrador',
      RESELLER: 'Revendedor',
      RESELLER_MANAGER: 'Ger. Revendedor',
      VOICE_ACTOR: 'Locutor',
      PRODUCER: 'Produtor',
      CLIENT: 'Cliente',
    };
    const role = this.inspection.effectiveRole() ?? this.appState.userRole();
    return role && role !== 'CLIENT' ? labels[role] : '';
  });
}
