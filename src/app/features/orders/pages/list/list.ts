import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppStateService } from '../../../../core/services/app-state';
import { NotificationService } from '../../../../core/services/notification';
import { OrderService } from '../../services/order';
import { ORDER_STATUS_LABELS } from '../../order-status.util';
import { Order, OrderStatus, OrderType } from '../../../../core/models/order.model';

@Component({
  selector: 'app-orders-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="p-6 max-w-6xl mx-auto space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Pedidos</h1>
          <p class="mt-1 text-sm text-neutral-500">Seus pedidos e seu andamento</p>
        </div>
        @if (isClient()) {
          <a routerLink="../orders/new" class="btn-primary">+ Novo pedido</a>
        }
      </header>

      <div class="flex flex-col gap-3 sm:flex-row">
        <select class="form-input sm:w-56" [value]="statusFilter()" (change)="onStatus($any($event.target).value)">
          <option value="">Todos os status</option>
          @for (s of statusOptions; track s) {
            <option [value]="s">{{ label(s) }}</option>
          }
        </select>
        <select class="form-input sm:w-48" [value]="typeFilter()" (change)="onType($any($event.target).value)">
          <option value="">Todos os tipos</option>
          <option value="VOICE">Locução</option>
          <option value="PRODUCTION">Produção</option>
        </select>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (orders().length === 0) {
        <p class="py-12 text-center text-sm text-neutral-500">Nenhum pedido encontrado.</p>
      } @else {
        <div class="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 dark:bg-neutral-900 text-left text-neutral-500">
              <tr>
                <th class="px-4 py-3 font-medium">Pedido</th>
                <th class="px-4 py-3 font-medium">Tipo</th>
                <th class="px-4 py-3 font-medium text-right">Créditos</th>
                <th class="px-4 py-3 font-medium">Prazo</th>
                <th class="px-4 py-3 font-medium text-center">Status</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              @for (o of orders(); track o.id) {
                <tr class="bg-white dark:bg-neutral-950">
                  <td class="px-4 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-400">{{ o.id.slice(0, 8) }}</td>
                  <td class="px-4 py-3">{{ o.orderType === 'VOICE' ? 'Locução' : 'Produção' }}</td>
                  <td class="px-4 py-3 text-right">{{ o.creditCost }} ({{ o.creditType }})</td>
                  <td class="px-4 py-3">{{ o.deadlineAt ? (o.deadlineAt | date: 'short') : '—' }}</td>
                  <td class="px-4 py-3 text-center">
                    <span class="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      {{ label(o.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <a [routerLink]="['../orders', o.id]" class="text-xs text-blue-600 hover:underline dark:text-blue-400">Detalhes</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class OrdersListPage {
  private readonly orderSvc = inject(OrderService);
  private readonly appState = inject(AppStateService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly statusOptions: OrderStatus[] = [
    'PENDING',
    'AWAITING_BRIEF',
    'IN_PROGRESS',
    'REVIEW',
    'COMPLETED',
    'CANCELLED',
    'DISPUTED',
  ];

  readonly statusFilter = signal<OrderStatus | ''>('');
  readonly typeFilter = signal<OrderType | ''>('');
  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);

  readonly isClient = computed(() => this.appState.isClient());

  constructor() {
    this.load();
  }

  label(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status] ?? status;
  }

  onStatus(value: string): void {
    this.statusFilter.set((value as OrderStatus) || '');
    this.load();
  }

  onType(value: string): void {
    this.typeFilter.set((value as OrderType) || '');
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.orderSvc
      .list({
        status: this.statusFilter() || undefined,
        orderType: this.typeFilter() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.orders.set(list);
          this.loading.set(false);
        },
        error: (err) => {
          this.notify.error(err.message ?? 'Erro ao carregar pedidos');
          this.loading.set(false);
        },
      });
  }
}
