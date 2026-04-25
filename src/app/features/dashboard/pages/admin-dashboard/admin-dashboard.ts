import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppStateService } from '../../../../core/services/app-state';

@Component({
  selector: 'app-admin-dashboard',
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
            Painel Administrativo · {{ appState.userRole() === 'SUPER_ADMIN' ? 'Super Admin' : 'Administrador' }}
          </p>
        </div>
        <span class="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
          Controle Total
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
                  {{ stat.change }} vs mês anterior
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
              class="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-neutral-200 transition hover:ring-violet-400 dark:bg-neutral-800 dark:ring-neutral-700"
            >
              <span class="text-3xl">{{ action.icon }}</span>
              <span class="text-xs font-medium text-neutral-700 dark:text-neutral-300">{{ action.label }}</span>
            </a>
          }
        </div>
      </section>

      <!-- Pedidos recentes + Alertas -->
      <section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="lg:col-span-2 rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700 overflow-hidden">
          <div class="border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
            <h3 class="font-semibold text-neutral-900 dark:text-white">Pedidos Recentes</h3>
          </div>
          <ul class="divide-y divide-neutral-100 dark:divide-neutral-700">
            @for (order of recentOrders; track order.id) {
              <li class="flex items-center justify-between px-5 py-3 text-sm">
                <div class="flex items-center gap-3">
                  <span class="w-2 h-2 rounded-full" [class]="order.statusColor"></span>
                  <div>
                    <p class="font-medium text-neutral-800 dark:text-neutral-200">{{ order.client }}</p>
                    <p class="text-xs text-neutral-400">{{ order.type }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-neutral-800 dark:text-neutral-200">{{ order.value }}</p>
                  <p class="text-xs text-neutral-400">{{ order.status }}</p>
                </div>
              </li>
            }
          </ul>
        </div>

        <div class="rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700 overflow-hidden">
          <div class="border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
            <h3 class="font-semibold text-neutral-900 dark:text-white">Alertas do Sistema</h3>
          </div>
          <ul class="divide-y divide-neutral-100 p-4 space-y-2 dark:divide-neutral-700">
            @for (alert of alerts; track alert.text) {
              <li class="flex items-start gap-3 py-2 text-sm">
                <span class="text-lg">{{ alert.icon }}</span>
                <div>
                  <p class="font-medium text-neutral-800 dark:text-neutral-200">{{ alert.text }}</p>
                  <p class="text-xs text-neutral-400">{{ alert.time }}</p>
                </div>
              </li>
            }
          </ul>
        </div>
      </section>

    </div>
  `,
})
export class AdminDashboardComponent {
  protected readonly appState = inject(AppStateService);

  protected readonly stats = [
    { label: 'Pedidos Hoje', value: '47', change: '18%', up: true, icon: '📦' },
    { label: 'Receita (mês)', value: 'R$ 52.840', change: '8.3%', up: true, icon: '💰' },
    { label: 'Usuários Ativos', value: '1.421', change: '5.1%', up: true, icon: '👥' },
    { label: 'Locutores Online', value: '12', change: '2', up: false, icon: '🎙️' },
  ];

  protected readonly quickActions = [
    { icon: '👥', label: 'Gerenciar Usuários', route: '/admin/users' },
    { icon: '📦', label: 'Ver Pedidos', route: '/admin/orders' },
    { icon: '💼', label: 'Revendedores', route: '/admin/resellers' },
    { icon: '📈', label: 'Relatórios', route: '/admin/reports' },
    { icon: '💰', label: 'Financeiro', route: '/admin/financial' },
    { icon: '🎙️', label: 'Locutores', route: '/admin/voice-actors' },
    { icon: '🎧', label: 'Produtores', route: '/admin/producers' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ];

  protected readonly recentOrders = [
    { id: 1, client: 'Agência XYZ', type: 'Spot com produção', value: 'R$ 180', status: 'Com locutor', statusColor: 'bg-blue-500' },
    { id: 2, client: 'João Silva', type: 'Locução OFF', value: 'R$ 90', status: 'Finalizado', statusColor: 'bg-emerald-500' },
    { id: 3, client: 'Rádio FM Top', type: 'Edição', value: 'R$ 120', status: 'Com produtor', statusColor: 'bg-yellow-500' },
    { id: 4, client: 'Marcos Lima', type: 'Locução OFF', value: 'R$ 70', status: 'Aguardando pgto', statusColor: 'bg-neutral-400' },
    { id: 5, client: 'DigitalMark', type: 'Spot com produção', value: 'R$ 220', status: 'Disponível', statusColor: 'bg-violet-500' },
  ];

  protected readonly alerts = [
    { icon: '⚠️', text: '3 pedidos aguardando há +2h', time: 'Agora' },
    { icon: '💳', text: 'Pagamento pendente #4521', time: 'há 15min' },
    { icon: '🎙️', text: 'Locutor Carlos offline', time: 'há 30min' },
    { icon: '✅', text: 'Backup diário concluído', time: 'há 1h' },
  ];
}
