import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppStateService } from '../../../../core/services/app-state';
import {
  AdminDashboardSummary,
  DashboardMetric,
} from '../../../../core/models/admin-dashboard.model';
import { AdminDashboardService } from '../../services/admin-dashboard';

@Component({
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="p-6 space-y-6">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">
            Olá, {{ appState.userName() }} 👋
          </h1>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Painel administrativo com dados oficiais
          </p>
        </div>
        @if (summary()) {
          <p class="text-xs text-neutral-400 dark:text-neutral-500">
            Atualizado {{ summary()!.generatedAt | date: 'short' }}
          </p>
        }
      </header>

      @if (loading()) {
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          @for (_ of [1, 2, 3, 4]; track _) {
            <div class="h-28 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"></div>
          }
        </div>
      } @else if (error()) {
        <section
          class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          <p>{{ error() }}</p>
          <button
            class="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 ring-1 ring-neutral-300 hover:bg-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:ring-neutral-300 dark:hover:bg-white"
            (click)="load()"
          >
            Tentar novamente
          </button>
        </section>
      } @else if (summary(); as data) {
        <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (card of cards(data); track card.label) {
            <div
              class="rounded-xl bg-white p-5 text-neutral-900 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700"
            >
              <p
                class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
              >
                {{ card.label }}
              </p>
              <p class="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
                {{ card.metric.current | number }}
                <span class="text-xs font-normal text-neutral-400 dark:text-neutral-500">{{
                  unit(card.metric)
                }}</span>
              </p>
              <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {{ comparison(card.metric) }}
              </p>
            </div>
          }
        </section>

        <section class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <a routerLink="/admin/users" class="quick-link">👥 Usuários</a>
          <a routerLink="/admin/orders" class="quick-link">📦 Pedidos</a>
          <a routerLink="/admin/professionals" class="quick-link">🎙️ Profissionais</a>
          <a routerLink="/admin/wallet-admin" class="quick-link">💰 Carteiras</a>
        </section>

        <section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div
            class="overflow-hidden rounded-xl bg-white text-neutral-900 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700 lg:col-span-2"
          >
            <h2
              class="border-b border-neutral-200 p-4 font-semibold text-neutral-900 dark:border-neutral-700 dark:text-white"
            >
              Pedidos recentes
            </h2>
            @if (data.recentOrders.length === 0) {
              <p class="p-6 text-sm text-neutral-500 dark:text-neutral-400">
                Nenhum pedido no período.
              </p>
            }
            @for (order of data.recentOrders; track order.id) {
              <a
                [routerLink]="['/admin/orders', order.id]"
                class="flex justify-between border-b border-neutral-200 px-5 py-3 text-sm text-neutral-700 hover:bg-neutral-50 last:border-0 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                <span
                  >{{ order.client.name || order.client.email }} ·
                  {{ order.lineItems.length }} item(ns)</span
                ><span>{{ order.status }}</span>
              </a>
            }
          </div>
          <div
            class="overflow-hidden rounded-xl bg-white text-neutral-900 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700"
          >
            <h2
              class="border-b border-neutral-200 p-4 font-semibold text-neutral-900 dark:border-neutral-700 dark:text-white"
            >
              Pendências
            </h2>
            @if (data.pendingActions.length === 0) {
              <p class="p-6 text-sm text-neutral-500 dark:text-neutral-400">Nenhuma pendência.</p>
            }
            @for (item of data.pendingActions; track item.type + item.id) {
              <a
                [routerLink]="item.targetPath"
                class="block border-b border-neutral-200 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 last:border-0 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-700"
                ><strong>{{ item.priority }}</strong> · {{ item.title }}</a
              >
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .quick-link {
        display: flex;
        min-height: 4rem;
        align-items: center;
        justify-content: center;
        border-radius: 0.75rem;
        background: #fff;
        color: #171717;
        padding: 1rem;
        box-shadow: 0 0 0 1px rgba(115, 115, 115, 0.2);
      }
      .quick-link:hover {
        background: #fafafa;
      }
      :host-context(.dark) .quick-link {
        background: #262626;
        color: #f5f5f5;
        box-shadow: 0 0 0 1px #404040;
      }
      :host-context(.dark) .quick-link:hover {
        background: #404040;
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  protected readonly appState = inject(AppStateService);
  private readonly service = inject(AdminDashboardService);
  private readonly destroyRef = inject(DestroyRef);
  readonly summary = signal<AdminDashboardSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .getSummary({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.summary.set(data);
          this.loading.set(false);
        },
        error: (error: Error) => {
          this.error.set(error.message || 'Não foi possível carregar o dashboard.');
          this.loading.set(false);
        },
      });
  }
  cards(data: AdminDashboardSummary) {
    return [
      { label: 'Pedidos no período', metric: data.metrics.ordersCreated },
      { label: 'Usuários ativos', metric: data.metrics.activeUsers },
      { label: 'Créditos consumidos', metric: data.metrics.creditsSpent },
      { label: 'Profissionais disponíveis', metric: data.metrics.availableProfessionals },
    ];
  }
  comparison(metric: DashboardMetric): string {
    return metric.variationPercent === null
      ? 'Sem base de comparação'
      : `${metric.variationPercent >= 0 ? '+' : ''}${metric.variationPercent}% vs. período anterior`;
  }
  unit(metric: DashboardMetric): string {
    return metric.unit === 'CREDITS' ? 'créditos' : '';
  }
}
