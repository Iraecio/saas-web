import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppStateService } from '../../../../core/services/app-state';

type ActorStatus = '10min' | '30min' | 'normal' | 'offline';

@Component({
  selector: 'app-voice-actor-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="p-6 space-y-6">

      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">
            Olá, {{ appState.userName() }} 🎙️
          </h1>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Painel do Locutor</p>
        </div>
        <!-- Status selector -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-neutral-500 dark:text-neutral-400">Meu status:</span>
          <div class="flex gap-1">
            @for (opt of statusOptions; track opt.value) {
              <button
                (click)="setStatus(opt.value)"
                class="rounded-full px-3 py-1 text-xs font-semibold transition"
                [class]="currentStatus() === opt.value ? opt.activeClass : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400'"
              >
                {{ opt.label }}
              </button>
            }
          </div>
        </div>
      </header>

      <!-- Stats -->
      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        @for (stat of stats; track stat.label) {
          <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{{ stat.label }}</p>
                <p class="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{{ stat.value }}</p>
                <p class="mt-1 text-xs text-neutral-400">{{ stat.sub }}</p>
              </div>
              <span class="text-2xl">{{ stat.icon }}</span>
            </div>
          </div>
        }
      </section>

      <!-- Fila de pedidos + Histórico -->
      <section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="lg:col-span-2 rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700 overflow-hidden">
          <div class="border-b border-neutral-200 px-5 py-4 dark:border-neutral-700 flex justify-between items-center">
            <h3 class="font-semibold text-neutral-900 dark:text-white">Minha Fila de Pedidos</h3>
            <span class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">{{ queue.length }} pendentes</span>
          </div>
          <ul class="divide-y divide-neutral-100 dark:divide-neutral-700">
            @for (order of queue; track order.id) {
              <li class="flex items-center justify-between px-5 py-4 text-sm">
                <div class="flex items-center gap-3">
                  <span class="flex h-8 w-8 items-center justify-center rounded-lg text-lg" [class]="order.urgent ? 'bg-red-100' : 'bg-blue-100'">
                    {{ order.urgent ? '🔥' : '📝' }}
                  </span>
                  <div>
                    <p class="font-medium text-neutral-800 dark:text-neutral-200">{{ order.client }}</p>
                    <p class="text-xs text-neutral-400">{{ order.type }} · {{ order.words }} palavras</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <p class="text-xs text-neutral-500">{{ order.deadline }}</p>
                  <button class="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition">
                    Aceitar
                  </button>
                </div>
              </li>
            }
          </ul>
          @if (queue.length === 0) {
            <div class="flex flex-col items-center justify-center py-12 text-neutral-400">
              <span class="text-4xl">✅</span>
              <p class="mt-2 text-sm">Fila vazia! Você está em dia.</p>
            </div>
          }
        </div>

        <div class="rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700 overflow-hidden">
          <div class="border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
            <h3 class="font-semibold text-neutral-900 dark:text-white">Entregas Recentes</h3>
          </div>
          <ul class="divide-y divide-neutral-100 dark:divide-neutral-700">
            @for (delivery of recentDeliveries; track delivery.id) {
              <li class="px-5 py-3 text-sm">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-neutral-800 dark:text-neutral-200">{{ delivery.client }}</p>
                    <p class="text-xs text-neutral-400">{{ delivery.type }}</p>
                  </div>
                  <span class="text-xs font-semibold text-emerald-600">{{ delivery.value }}</span>
                </div>
                <p class="mt-1 text-xs text-neutral-400">{{ delivery.date }}</p>
              </li>
            }
          </ul>
          <div class="border-t border-neutral-200 px-5 py-3 dark:border-neutral-700">
            <a routerLink="/admin/history" class="text-xs text-blue-500 hover:underline">Ver histórico completo →</a>
          </div>
        </div>
      </section>

    </div>
  `,
})
export class VoiceActorDashboardComponent {
  protected readonly appState = inject(AppStateService);
  protected readonly currentStatus = signal<ActorStatus>('normal');

  setStatus(status: ActorStatus): void {
    this.currentStatus.set(status);
  }

  protected readonly statusOptions: Array<{ value: ActorStatus; label: string; activeClass: string }> = [
    { value: '10min', label: '🚀 10min', activeClass: 'bg-emerald-500 text-white' },
    { value: '30min', label: '⚡ 30min', activeClass: 'bg-yellow-400 text-white' },
    { value: 'normal', label: '🟢 Normal', activeClass: 'bg-blue-500 text-white' },
    { value: 'offline', label: '⭕ Offline', activeClass: 'bg-neutral-500 text-white' },
  ];

  protected readonly stats = [
    { label: 'Na Fila', value: '3', sub: 'pedidos aguardando', icon: '📥' },
    { label: 'Entregues (mês)', value: '58', sub: 'este mês', icon: '✅' },
    { label: 'Ganhos (mês)', value: 'R$ 2.940', sub: 'saldo a receber', icon: '💰' },
    { label: 'Avaliação Média', value: '4.9 ⭐', sub: 'últimas 30 avaliações', icon: '🎖️' },
  ];

  protected readonly queue = [
    { id: 1, client: 'Rádio Hits FM', type: 'Spot com produção', words: 120, deadline: '🔥 10min', urgent: true },
    { id: 2, client: 'Agência Digital', type: 'Locução OFF', words: 80, deadline: '⚡ 30min', urgent: false },
    { id: 3, client: 'João Silva', type: 'Locução OFF', words: 60, deadline: '🟢 2h', urgent: false },
  ];

  protected readonly recentDeliveries = [
    { id: 1, client: 'Studio Sound', type: 'Locução OFF', value: 'R$ 90', date: 'hoje, 09:15' },
    { id: 2, client: 'Marcos Lima', type: 'Spot', value: 'R$ 180', date: 'ontem, 16:40' },
    { id: 3, client: 'DigitalMark', type: 'Locução OFF', value: 'R$ 70', date: 'ontem, 11:20' },
    { id: 4, client: 'Rádio Top', type: 'Spot', value: 'R$ 220', date: '22/04, 14:30' },
  ];
}
