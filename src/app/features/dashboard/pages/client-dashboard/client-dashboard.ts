import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppStateService } from '../../../../core/services/app-state';

@Component({
  selector: 'app-client-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="p-6 space-y-6">

      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">
            Olá, {{ appState.userName() }} 👋
          </h1>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">O que você precisa hoje?</p>
        </div>
        <!-- Créditos -->
        <div class="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:ring-emerald-700">
          <span class="text-xl">💳</span>
          <div>
            <p class="text-xs text-emerald-600 dark:text-emerald-400">Seus créditos</p>
            <p class="text-lg font-bold text-emerald-700 dark:text-emerald-300">R$ 240,00</p>
          </div>
          <a routerLink="/admin/credits" class="ml-2 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600 transition">
            + Recarregar
          </a>
        </div>
      </header>

      <!-- CTA principal: Novo Pedido -->
      <section class="rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 p-6 text-white shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold">Precisa de uma locução?</h2>
            <p class="mt-1 text-sm text-white/80">Faça seu pedido e receba em minutos.</p>
          </div>
          <a
            routerLink="/admin/orders/new"
            class="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow transition hover:scale-105"
          >
            <span>🎙️</span> Novo Pedido
          </a>
        </div>
      </section>

      <!-- Stats -->
      <section class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        @for (stat of stats; track stat.label) {
          <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
            <p class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{{ stat.label }}</p>
            <p class="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{{ stat.value }}</p>
            <p class="mt-1 text-xs text-neutral-400">{{ stat.sub }}</p>
          </div>
        }
      </section>

      <!-- Meus pedidos + Locutores favoritos -->
      <section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="lg:col-span-2 rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700 overflow-hidden">
          <div class="border-b border-neutral-200 px-5 py-4 dark:border-neutral-700 flex justify-between items-center">
            <h3 class="font-semibold text-neutral-900 dark:text-white">Meus Pedidos</h3>
            <a routerLink="/admin/my-orders" class="text-xs text-blue-500 hover:underline">Ver todos</a>
          </div>
          <ul class="divide-y divide-neutral-100 dark:divide-neutral-700">
            @for (order of myOrders; track order.id) {
              <li class="flex items-center justify-between px-5 py-3 text-sm">
                <div class="flex items-center gap-3">
                  <span class="text-xl">{{ order.icon }}</span>
                  <div>
                    <p class="font-medium text-neutral-800 dark:text-neutral-200">{{ order.title }}</p>
                    <p class="text-xs text-neutral-400">{{ order.type }} · {{ order.date }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" [class]="order.statusClass">
                    {{ order.status }}
                  </span>
                  @if (order.canDownload) {
                    <button class="rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200 transition">
                      ⬇️
                    </button>
                  }
                  @if (order.canReview) {
                    <button class="rounded-lg bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 hover:bg-yellow-200 transition">
                      Revisão
                    </button>
                  }
                </div>
              </li>
            }
          </ul>
        </div>

        <div class="rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700 overflow-hidden">
          <div class="border-b border-neutral-200 px-5 py-4 dark:border-neutral-700 flex justify-between items-center">
            <h3 class="font-semibold text-neutral-900 dark:text-white">⭐ Favoritos</h3>
            <a routerLink="/admin/voice-actors" class="text-xs text-blue-500 hover:underline">Ver todos</a>
          </div>
          <ul class="divide-y divide-neutral-100 dark:divide-neutral-700">
            @for (actor of favoriteActors; track actor.id) {
              <li class="flex items-center justify-between px-5 py-3 text-sm">
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-base font-bold text-violet-700 dark:bg-violet-900/30">
                    {{ actor.name[0] }}
                  </div>
                  <div>
                    <p class="font-medium text-neutral-800 dark:text-neutral-200">{{ actor.name }}</p>
                    <p class="text-xs" [class]="actor.statusClass">{{ actor.status }}</p>
                  </div>
                </div>
                <button
                  routerLink="/admin/orders/new"
                  class="rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-600 transition"
                >
                  Pedir
                </button>
              </li>
            }
          </ul>
        </div>
      </section>

    </div>
  `,
})
export class ClientDashboardComponent {
  protected readonly appState = inject(AppStateService);

  protected readonly stats = [
    { label: 'Em andamento', value: '2', sub: 'pedidos ativos' },
    { label: 'Total de Pedidos', value: '48', sub: 'todos os tempos' },
    { label: 'Entregues', value: '45', sub: 'finalizados' },
    { label: 'Revisões', value: '1', sub: 'aguardando' },
  ];

  protected readonly myOrders = [
    {
      id: 1,
      title: 'Spot Promoção Maio',
      type: 'Spot',
      date: 'hoje',
      icon: '🎵',
      status: 'Com locutor',
      statusClass: 'bg-blue-100 text-blue-700',
      canDownload: false,
      canReview: false,
    },
    {
      id: 2,
      title: 'Vinheta Abertura',
      type: 'Locução OFF',
      date: 'ontem',
      icon: '🎙️',
      status: 'Disponível',
      statusClass: 'bg-emerald-100 text-emerald-700',
      canDownload: true,
      canReview: true,
    },
    {
      id: 3,
      title: 'Narração Vídeo',
      type: 'Locução OFF',
      date: '22/04',
      icon: '🎬',
      status: 'Finalizado',
      statusClass: 'bg-neutral-100 text-neutral-600',
      canDownload: true,
      canReview: false,
    },
    {
      id: 4,
      title: 'Comercial Produto X',
      type: 'Spot',
      date: '20/04',
      icon: '📢',
      status: 'Finalizado',
      statusClass: 'bg-neutral-100 text-neutral-600',
      canDownload: true,
      canReview: false,
    },
  ];

  protected readonly favoriteActors = [
    { id: 1, name: 'Carlos Voz', status: '🚀 Disponível em 10min', statusClass: 'text-emerald-600 font-medium' },
    { id: 2, name: 'Ana Ribeiro', status: '⚡ Disponível em 30min', statusClass: 'text-yellow-600 font-medium' },
    { id: 3, name: 'Marcos Lima', status: '⭕ Offline', statusClass: 'text-neutral-400' },
  ];
}
