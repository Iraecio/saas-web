import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderAdminOrder } from '../../../../core/models/order-admin.model';
import { OrderStatus } from '../../../../core/models/order.model';
import { ORDER_STATUS_LABELS } from '../../order-status.util';
import { OrderAdminService } from '../../services/order-admin';

@Component({
  selector: 'app-order-admin-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  template: `
    <main class="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
      <nav aria-label="Breadcrumb">
        <a
          class="text-sm text-neutral-500 underline-offset-4 hover:underline"
          routerLink="/admin/orders/manage"
          >← Gestão de pedidos</a
        >
      </nav>
      @if (loading()) {
        <div class="space-y-4" aria-busy="true" aria-label="Carregando pedido">
          <div class="h-28 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
          <div class="h-64 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
      } @else if (error()) {
        <section class="card py-14 text-center" role="alert">
          <h1 class="text-xl font-semibold">Pedido indisponível</h1>
          <p class="mt-2 text-sm text-neutral-500">{{ error() }}</p>
          <button class="btn-secondary mt-5" type="button" (click)="load()">
            Tentar novamente
          </button>
        </section>
      } @else if (order(); as current) {
        <header
          class="flex flex-col gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Pedido</p>
            <h1 class="mt-1 font-mono text-2xl font-semibold sm:text-3xl">
              #{{ shortId(current.id) }}
            </h1>
            <p class="mt-2 text-sm text-neutral-500">
              Criado em {{ current.createdAt | date: 'dd/MM/yyyy HH:mm' }} · Atualizado em
              {{ current.updatedAt | date: 'dd/MM/yyyy HH:mm' }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="badge !px-3 !py-2">{{ statusLabel(current.status) }}</span
            ><a
              class="btn-primary inline-flex min-h-11 items-center"
              [routerLink]="['/admin/orders', current.id]"
              >Abrir ações operacionais</a
            >
          </div>
        </header>

        <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Resumo do pedido">
          <article class="card !p-4">
            <p class="text-xs text-neutral-500">Cliente</p>
            <p class="mt-2 font-semibold">{{ current.client.name }}</p>
            <p class="truncate text-xs text-neutral-500">{{ current.client.email }}</p>
          </article>
          <article class="card !p-4">
            <p class="text-xs text-neutral-500">Origem</p>
            <p class="mt-2 font-semibold">{{ current.resellerId ? 'Revenda' : 'Plataforma' }}</p>
            <p class="text-xs text-neutral-500">
              {{ current.reseller?.companyName || 'Operação direta' }}
            </p>
          </article>
          <article class="card !p-4">
            <p class="text-xs text-neutral-500">Créditos</p>
            <p class="mt-2 text-2xl font-semibold">{{ credits(current) }}</p>
            <p class="text-xs text-neutral-500">{{ current.lineItems.length }} item(ns)</p>
          </article>
          <article class="card !p-4">
            <p class="text-xs text-neutral-500">Prazo mais próximo</p>
            <p class="mt-2 font-semibold" [class.text-red-700]="isOverdue(current)">
              {{ deadline(current) ? (deadline(current) | date: 'dd/MM/yyyy HH:mm') : 'Sem prazo' }}
            </p>
            @if (isOverdue(current)) {
              <p class="text-xs font-medium text-red-700">Atrasado</p>
            }
          </article>
        </section>

        <section class="card">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold">Itens do pedido</h2>
              <p class="text-sm text-neutral-500">
                Serviços, responsáveis, valores e andamento individual.
              </p>
            </div>
            <button class="btn-secondary min-h-11" type="button" (click)="load()">Atualizar</button>
          </div>
          <div class="mt-5 space-y-3">
            @for (item of current.lineItems; track item.id; let index = $index) {
              <article class="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
                <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Item {{ index + 1 }} ·
                      {{ item.itemType === 'VOICE' ? 'Locução' : 'Produção' }}
                    </p>
                    <h3 class="mt-1 font-semibold">
                      {{ item.service?.name || 'Serviço não identificado' }}
                    </h3>
                    <p class="mt-1 text-sm text-neutral-500">
                      {{ item.professional?.name || 'Profissional não atribuído'
                      }}<span class="block sm:inline">{{
                        item.professional?.email ? ' · ' + item.professional?.email : ''
                      }}</span>
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="badge">{{ statusLabel(item.status) }}</span
                    ><strong>{{ item.creditCost }} créditos</strong>
                  </div>
                </div>
                <dl
                  class="mt-4 grid gap-3 border-t border-neutral-200 pt-4 text-sm dark:border-neutral-800 sm:grid-cols-3"
                >
                  <div>
                    <dt class="text-xs text-neutral-500">Revisões</dt>
                    <dd>{{ item.revisionCount }} de {{ item.maxRevisions }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs text-neutral-500">Prazo</dt>
                    <dd>
                      {{
                        item.deadlineAt
                          ? (item.deadlineAt | date: 'dd/MM/yyyy HH:mm')
                          : 'Não definido'
                      }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-xs text-neutral-500">Última atualização</dt>
                    <dd>
                      {{ item.updatedAt ? (item.updatedAt | date: 'dd/MM/yyyy HH:mm') : '—' }}
                    </dd>
                  </div>
                </dl>
                @if (item.briefing) {
                  <div class="mt-4 rounded-md bg-neutral-50 p-3 text-sm dark:bg-neutral-950">
                    <p class="mb-1 text-xs font-medium text-neutral-500">Briefing</p>
                    <p class="whitespace-pre-wrap">{{ item.briefing }}</p>
                  </div>
                }
                @if (item.deliveryUrl) {
                  <a
                    class="mt-4 inline-flex min-h-11 items-center text-sm font-medium underline"
                    [href]="item.deliveryUrl"
                    target="_blank"
                    rel="noopener"
                    >Abrir entrega em nova aba</a
                  >
                }
              </article>
            }
          </div>
        </section>

        <section class="card">
          <h2 class="text-lg font-semibold">Contexto geral</h2>
          @if (current.briefing) {
            <p class="mt-3 whitespace-pre-wrap text-sm leading-6">{{ current.briefing }}</p>
          } @else {
            <p class="mt-3 text-sm text-neutral-500">Nenhum briefing geral foi informado.</p>
          }
        </section>
        <p class="sr-only" aria-live="polite">{{ announcement() }}</p>
      }
    </main>
  `,
})
export class OrderAdminDetailPage {
  private readonly api = inject(OrderAdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly order = signal<OrderAdminOrder | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly announcement = signal('');

  constructor() {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api
      .getById(this.route.snapshot.paramMap.get('id') ?? '')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (order) => {
          this.order.set(order);
          this.loading.set(false);
          this.announcement.set('Pedido atualizado');
        },
        error: (error: Error) => {
          this.error.set(error.message || 'Erro ao carregar pedido');
          this.loading.set(false);
        },
      });
  }
  shortId(id: string): string {
    return id.slice(0, 8).toUpperCase();
  }
  statusLabel(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status] ?? status;
  }
  credits(order: OrderAdminOrder): number {
    return order.lineItems.reduce((sum, item) => sum + item.creditCost, 0);
  }
  deadline(order: OrderAdminOrder): string | null {
    return (
      order.lineItems
        .map((item) => item.deadlineAt)
        .filter((value): value is string => Boolean(value))
        .sort()[0] ?? null
    );
  }
  isOverdue(order: OrderAdminOrder): boolean {
    const value = this.deadline(order);
    return Boolean(
      value &&
      new Date(value).getTime() < Date.now() &&
      !['COMPLETED', 'CANCELLED'].includes(order.status),
    );
  }
}
