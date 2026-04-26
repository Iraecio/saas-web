import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppStateService } from '../../../core/services/app-state';
import { UserRole } from '../../../core/models/user.model';

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
    { icon: '🎯', label: 'Solicitações de Papel', route: '/admin/role-requests' },
    { icon: '📦', label: 'Pedidos', route: '/admin/orders' },
    { icon: '🎙️', label: 'Locutores', route: '/admin/voice-actors' },
    { icon: '🎧', label: 'Produtores', route: '/admin/producers' },
    { icon: '💼', label: 'Revendedores', route: '/admin/resellers' },
    { icon: '💰', label: 'Financeiro', route: '/admin/financial' },
    { icon: '📈', label: 'Relatórios', route: '/admin/reports' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ],
  ADMIN: [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '👥', label: 'Usuários', route: '/admin/users' },
    { icon: '🎯', label: 'Solicitações de Papel', route: '/admin/role-requests' },
    { icon: '📦', label: 'Pedidos', route: '/admin/orders' },
    { icon: '🎙️', label: 'Locutores', route: '/admin/voice-actors' },
    { icon: '🎧', label: 'Produtores', route: '/admin/producers' },
    { icon: '💼', label: 'Revendedores', route: '/admin/resellers' },
    { icon: '💰', label: 'Financeiro', route: '/admin/financial' },
    { icon: '📈', label: 'Relatórios', route: '/admin/reports' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ],
  RESELLER: [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '👥', label: 'Meus Clientes', route: '/admin/clients' },
    { icon: '📦', label: 'Pedidos', route: '/admin/orders' },
    { icon: '💵', label: 'Comissões', route: '/admin/commissions' },
    { icon: '🌐', label: 'Meu Site', route: '/admin/my-site' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ],
  RESELLER_MANAGER: [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '👥', label: 'Meus Clientes', route: '/admin/clients' },
    { icon: '📦', label: 'Pedidos', route: '/admin/orders' },
    { icon: '💵', label: 'Comissões', route: '/admin/commissions' },
    { icon: '🌐', label: 'Meu Site', route: '/admin/my-site' },
    { icon: '📈', label: 'Relatórios', route: '/admin/reports' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ],
  VOICE_ACTOR: [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '📥', label: 'Minha Fila', route: '/admin/my-queue' },
    { icon: '📜', label: 'Histórico', route: '/admin/history' },
    { icon: '💰', label: 'Ganhos', route: '/admin/earnings' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ],
  PRODUCER: [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '📥', label: 'Produção', route: '/admin/production' },
    { icon: '📜', label: 'Histórico', route: '/admin/history' },
    { icon: '💰', label: 'Ganhos', route: '/admin/earnings' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ],
  CLIENT: [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '➕', label: 'Novo Pedido', route: '/admin/orders/new' },
    { icon: '📦', label: 'Meus Pedidos', route: '/admin/my-orders' },
    { icon: '🎙️', label: 'Locutores', route: '/admin/voice-actors' },
    { icon: '⭐', label: 'Favoritos', route: '/admin/favorites' },
    { icon: '💳', label: 'Créditos', route: '/admin/credits' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ],
};

const DIRECT_CLIENT_MENU: MenuItem[] = [
  { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
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
      class="flex h-full flex-col border-r border-neutral-200 bg-white transition-all duration-300 dark:border-neutral-700 dark:bg-neutral-800"
      [class]="widthClasses()"
    >
      <div class="flex h-16 items-center justify-center border-b border-neutral-200 px-6 dark:border-neutral-700">
        <h2 class="text-xl font-bold text-neutral-900 dark:text-white">
          @if (open()) {
            <span>SaaS Web</span>
          } @else {
            <span>SW</span>
          }
        </h2>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto p-4">
        @for (item of menuItems(); track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="sidebar-item-active"
            class="sidebar-item"
          >
            <span class="text-xl">{{ item.icon }}</span>
            @if (open()) {
              <span class="text-sm font-medium">{{ item.label }}</span>
              @if (item.badge) {
                <span class="ml-auto rounded-full bg-danger px-2 py-0.5 text-xs font-bold text-white">
                  {{ item.badge }}
                </span>
              }
            }
          </a>
        }
      </nav>

      <div class="border-t border-neutral-200 p-4 dark:border-neutral-700">
        @if (open()) {
          <div class="flex items-center gap-2">
            <div class="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
              {{ appState.userName()[0]?.toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-xs font-medium text-neutral-700 dark:text-neutral-300">{{ appState.userName() }}</p>
              <p class="text-xs text-neutral-400">{{ roleLabel() }}</p>
            </div>
          </div>
        } @else {
          <div class="flex justify-center">
            <div class="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900/30">
              {{ appState.userName()[0]?.toUpperCase() }}
            </div>
          </div>
        }
        <p class="mt-2 text-xs text-neutral-400">{{ open() ? 'v0.1.0' : '' }}</p>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly open = input(true);
  protected readonly appState = inject(AppStateService);

  readonly widthClasses = computed(() => (this.open() ? 'w-64' : 'w-20'));

  readonly menuItems = computed((): MenuItem[] => {
    const user = this.appState.user();
    if (!user?.role) return [];
    if (user.role === 'CLIENT' && !user.resellerId) return DIRECT_CLIENT_MENU;
    return MENU_BY_ROLE[user.role] ?? [];
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
    const role = this.appState.userRole();
    return role ? labels[role] : '';
  });
}
