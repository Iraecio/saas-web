import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppStateService } from '../../../../core/services/app-state';

@Component({
  selector: 'app-reseller-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="p-6 space-y-6">

      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">
            Olá, {{ appState.userName() }} 👋
          </h1>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Painel do Revendedor · {{ appState.userRole() === 'RESELLER_MANAGER' ? 'Gerente' : 'Revendedor' }}
          </p>
        </div>
        <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          💼 Revendedor
        </span>
      </header>

      <!-- Stats -->
      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        @for (stat of stats; track stat.label) {
          <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{{ stat.label }}</p>
                <p class="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{{ stat.value }}</p>
                <p class="mt-1 flex items-center gap-1 text-xs" [class]="stat.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'">
                  <span>{{ stat.up ? '↑' : '↓' }}</span>
                  {{ stat.change }}
                </p>
              </div>
              <span class="text-2xl">{{ stat.icon }}</span>
            </div>
          </div>
        }
      </section>

      <!-- Ações rápidas -->
      <section>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Acesso Rápido</h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          @for (action of quickActions; track action.label) {
            <a
              [routerLink]="action.route"
              class="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-neutral-200 transition hover:ring-blue-400 dark:bg-neutral-800 dark:ring-neutral-700"
            >
              <span class="text-3xl">{{ action.icon }}</span>
              <span class="text-xs font-medium text-neutral-700 dark:text-neutral-300">{{ action.label }}</span>
            </a>
          }
        </div>
      </section>

      <!-- Clientes + Funil CRM -->
      <section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="lg:col-span-2 rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700 overflow-hidden">
          <div class="border-b border-neutral-200 px-5 py-4 dark:border-neutral-700 flex justify-between items-center">
            <h3 class="font-semibold text-neutral-900 dark:text-white">Clientes Recentes</h3>
            <a routerLink="/admin/clients" class="text-xs text-blue-500 hover:underline">Ver todos</a>
          </div>
          <ul class="divide-y divide-neutral-100 dark:divide-neutral-700">
            @for (client of recentClients; track client.id) {
              <li class="flex items-center justify-between px-5 py-3 text-sm">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900/30">
                    {{ client.name[0] }}
                  </div>
                  <div>
                    <p class="font-medium text-neutral-800 dark:text-neutral-200">{{ client.name }}</p>
                    <p class="text-xs text-neutral-400">{{ client.email }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{{ client.orders }} pedidos</p>
                  <span class="rounded-full px-2 py-0.5 text-xs" [class]="client.statusClass">{{ client.stage }}</span>
                </div>
              </li>
            }
          </ul>
        </div>

        <div class="rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700 overflow-hidden">
          <div class="border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
            <h3 class="font-semibold text-neutral-900 dark:text-white">Funil de Vendas</h3>
          </div>
          <div class="p-5 space-y-3">
            @for (stage of funnel; track stage.label) {
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ stage.label }}</span>
                  <span class="text-neutral-500">{{ stage.count }}</span>
                </div>
                <div class="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-700">
                  <div class="h-2 rounded-full" [class]="stage.color" [style.width]="stage.pct"></div>
                </div>
              </div>
            }
          </div>
          <div class="border-t border-neutral-200 px-5 py-3 dark:border-neutral-700">
            <p class="text-xs text-neutral-500">Follow-ups pendentes: <span class="font-bold text-blue-500">5</span></p>
          </div>
        </div>
      </section>

    </div>
  `,
})
export class ResellerDashboardComponent {
  protected readonly appState = inject(AppStateService);

  protected readonly stats = [
    { label: 'Clientes Ativos', value: '84', change: '6 novos este mês', up: true, icon: '👥' },
    { label: 'Pedidos (mês)', value: '132', change: '22% vs mês anterior', up: true, icon: '📦' },
    { label: 'Comissão Acumulada', value: 'R$ 4.210', change: '18% vs mês anterior', up: true, icon: '💵' },
    { label: 'Leads no Funil', value: '31', change: '4 novos hoje', up: true, icon: '🎯' },
  ];

  protected readonly quickActions = [
    { icon: '➕', label: 'Novo Cliente', route: '/admin/clients/new' },
    { icon: '📦', label: 'Criar Pedido', route: '/admin/orders/new' },
    { icon: '🧠', label: 'CRM', route: '/admin/clients' },
    { icon: '🌐', label: 'Meu Site', route: '/admin/my-site' },
    { icon: '💵', label: 'Comissões', route: '/admin/commissions' },
    { icon: '📈', label: 'Relatórios', route: '/admin/reports' },
  ];

  protected readonly recentClients = [
    { id: 1, name: 'Agência Digital SP', email: 'contato@agenciasp.com', orders: 14, stage: 'Cliente', statusClass: 'bg-emerald-100 text-emerald-700' },
    { id: 2, name: 'Rafael Moreira', email: 'rafael@email.com', orders: 3, stage: 'Ativo', statusClass: 'bg-blue-100 text-blue-700' },
    { id: 3, name: 'Rádio Hits FM', email: 'rh@hitsfm.com.br', orders: 28, stage: 'VIP', statusClass: 'bg-violet-100 text-violet-700' },
    { id: 4, name: 'Pedro Carvalho', email: 'pedro@email.com', orders: 1, stage: 'Lead', statusClass: 'bg-yellow-100 text-yellow-700' },
    { id: 5, name: 'Studio Sound', email: 'contato@studio.com', orders: 7, stage: 'Ativo', statusClass: 'bg-blue-100 text-blue-700' },
  ];

  protected readonly funnel = [
    { label: 'Leads capturados', count: 31, pct: '100%', color: 'bg-blue-200' },
    { label: 'Contato realizado', count: 22, pct: '71%', color: 'bg-blue-300' },
    { label: 'Proposta enviada', count: 14, pct: '45%', color: 'bg-blue-400' },
    { label: 'Em negociação', count: 8, pct: '26%', color: 'bg-blue-500' },
    { label: 'Fechado', count: 5, pct: '16%', color: 'bg-blue-600' },
  ];
}
