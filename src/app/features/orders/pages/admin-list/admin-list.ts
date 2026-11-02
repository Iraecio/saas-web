import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import {
  DEFAULT_ORDER_ADMIN_QUERY,
  OrderAdminOrder,
  OrderAdminPage,
  OrderAdminQuery,
} from '../../../../core/models/order-admin.model';
import { OrderStatus } from '../../../../core/models/order.model';
import { ORDER_STATUS_LABELS } from '../../order-status.util';
import { OrderAdminService } from '../../services/order-admin';
import { OrderAdminQueryService } from '../../services/order-admin-query';

@Component({
  selector: 'app-order-admin-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
    <main class="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6 lg:p-8">
      <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Operações
          </p>
          <h1 class="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Gestão de pedidos</h1>
          <p class="mt-1 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
            Visão global dos pedidos, clientes, profissionais, valores e prazos.
          </p>
        </div>
        <button
          class="btn-secondary min-h-11"
          type="button"
          (click)="exportCsv()"
          [disabled]="!page()?.items?.length"
        >
          Exportar página em CSV
        </button>
      </header>

      <section class="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumo da consulta">
        <article class="card !p-4">
          <p class="text-xs text-neutral-500">Resultados</p>
          <p class="mt-2 text-2xl font-semibold">{{ page()?.total ?? '—' }}</p>
        </article>
        <article class="card !p-4">
          <p class="text-xs text-neutral-500">Nesta página</p>
          <p class="mt-2 text-2xl font-semibold">{{ page()?.items?.length ?? '—' }}</p>
        </article>
        <article class="card !p-4">
          <p class="text-xs text-neutral-500">Em atraso</p>
          <p class="mt-2 text-2xl font-semibold">{{ overdueCount() }}</p>
        </article>
        <article class="card !p-4">
          <p class="text-xs text-neutral-500">Selecionados</p>
          <p class="mt-2 text-2xl font-semibold">{{ selected().size }}</p>
        </article>
      </section>

      @if (!online()) {
        <div
          class="rounded-md border border-neutral-400 bg-neutral-100 px-4 py-3 text-sm dark:bg-neutral-800"
          role="status"
        >
          Sem conexão. Os filtros foram preservados; tente novamente quando a conexão voltar.
        </div>
      }

      <section class="card !p-4 sm:!p-5" aria-label="Busca e filtros">
        <form
          class="grid gap-3 md:grid-cols-2 xl:grid-cols-6"
          (submit)="applyFilters(); $event.preventDefault()"
        >
          <label class="md:col-span-2 xl:col-span-2">
            <span class="form-label">Buscar</span>
            <input
              class="form-input min-h-11"
              name="search"
              [(ngModel)]="draft.q"
              maxlength="120"
              placeholder="Pedido, cliente, e-mail ou profissional"
            />
          </label>
          <label>
            <span class="form-label">Status</span>
            <select class="form-input min-h-11" name="status" [(ngModel)]="draft.status">
              <option value="">Todos</option>
              @for (status of statuses; track status) {
                <option [value]="status">{{ statusLabel(status) }}</option>
              }
            </select>
          </label>
          <label>
            <span class="form-label">Tipo</span>
            <select class="form-input min-h-11" name="type" [(ngModel)]="draft.orderType">
              <option value="">Todos</option>
              <option value="VOICE">Locução</option>
              <option value="PRODUCTION">Produção</option>
            </select>
          </label>
          <label>
            <span class="form-label">Origem</span>
            <select class="form-input min-h-11" name="origin" [(ngModel)]="draft.origin">
              <option value="">Todas</option>
              <option value="PLATFORM">Plataforma</option>
              <option value="RESELLER">Revenda</option>
            </select>
          </label>
          <label>
            <span class="form-label">Ordenar</span>
            <select class="form-input min-h-11" name="sort" [(ngModel)]="draft.sort">
              <option value="createdAt">Criação</option>
              <option value="updatedAt">Atualização</option>
              <option value="deadlineAt">Prazo</option>
              <option value="totalCredits">Créditos</option>
            </select>
          </label>
          <label
            ><span class="form-label">Criado a partir de</span
            ><input
              class="form-input min-h-11"
              type="date"
              name="startDate"
              [(ngModel)]="draft.startDate"
          /></label>
          <label
            ><span class="form-label">Criado até</span
            ><input
              class="form-input min-h-11"
              type="date"
              name="endDate"
              [(ngModel)]="draft.endDate"
          /></label>
          <label
            class="flex min-h-11 items-center gap-2 self-end rounded-md border border-neutral-300 px-3 dark:border-neutral-700"
          >
            <input type="checkbox" name="overdue" [(ngModel)]="draft.overdue" /><span
              class="text-sm"
              >Somente atrasados</span
            >
          </label>
          <label
            ><span class="form-label">Direção</span
            ><select class="form-input min-h-11" name="direction" [(ngModel)]="draft.direction">
              <option value="desc">Mais recentes</option>
              <option value="asc">Mais antigos</option>
            </select></label
          >
          <div class="flex items-end gap-2 md:col-span-2">
            <button class="btn-primary min-h-11 flex-1" type="submit">Aplicar filtros</button>
            <button class="btn-secondary min-h-11" type="button" (click)="clearFilters()">
              Limpar
            </button>
          </div>
        </form>
      </section>

      @if (selected().size > 0) {
        <section
          class="sticky top-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-md bg-neutral-900 px-4 py-3 text-white shadow-lg dark:bg-white dark:text-neutral-900"
          aria-live="polite"
        >
          <p class="text-sm font-medium">{{ selected().size }} pedido(s) selecionado(s)</p>
          <div class="flex gap-2">
            <button
              class="rounded border px-3 py-2 text-sm"
              type="button"
              (click)="exportCsv(true)"
            >
              Exportar selecionados</button
            ><button
              class="rounded border px-3 py-2 text-sm"
              type="button"
              (click)="clearSelection()"
            >
              Limpar seleção
            </button>
          </div>
        </section>
      }

      @if (loading() && !page()) {
        <section class="space-y-3" aria-label="Carregando pedidos" aria-busy="true">
          @for (item of skeletons; track item) {
            <div class="h-20 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
          }
        </section>
      } @else if (error()) {
        <section class="card py-12 text-center" role="alert">
          <h2 class="font-semibold">Não foi possível carregar os pedidos</h2>
          <p class="mt-2 text-sm text-neutral-500">{{ error() }}</p>
          <button class="btn-secondary mt-5" type="button" (click)="reload()">
            Tentar novamente
          </button>
        </section>
      } @else if (page()?.items?.length === 0) {
        <section class="card py-14 text-center">
          <h2 class="font-semibold">Nenhum pedido encontrado</h2>
          <p class="mt-2 text-sm text-neutral-500">
            Ajuste a busca ou limpe os filtros selecionados.
          </p>
          <button class="btn-secondary mt-5" type="button" (click)="clearFilters()">
            Limpar filtros
          </button>
        </section>
      } @else {
        @if (loading()) {
          <p class="text-xs text-neutral-500" role="status">Atualizando resultados…</p>
        }
        <section
          class="hidden overflow-hidden rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:block"
        >
          <table class="w-full text-left text-sm">
            <thead
              class="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <tr>
                <th class="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Selecionar página"
                    [checked]="allPageSelected()"
                    (change)="togglePage()"
                  />
                </th>
                <th class="px-4 py-3">Pedido</th>
                <th class="px-4 py-3">Cliente</th>
                <th class="px-4 py-3">Profissional</th>
                <th class="px-4 py-3">Origem</th>
                <th class="px-4 py-3 text-right">Créditos</th>
                <th class="px-4 py-3">Prazo</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3"><span class="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              @for (order of page()?.items; track order.id) {
                <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                  <td class="px-4 py-4">
                    <input
                      type="checkbox"
                      [attr.aria-label]="'Selecionar pedido ' + shortId(order.id)"
                      [checked]="selected().has(order.id)"
                      (change)="toggle(order.id)"
                    />
                  </td>
                  <td class="px-4 py-4">
                    <a
                      class="font-mono text-xs font-semibold underline-offset-4 hover:underline"
                      [routerLink]="['/admin/orders/manage', order.id]"
                      [queryParams]="{ return: currentUrl() }"
                      >#{{ shortId(order.id) }}</a
                    >
                    <p class="mt-1 text-xs text-neutral-500">
                      {{ order.createdAt | date: 'dd/MM/yy HH:mm' }}
                    </p>
                  </td>
                  <td class="px-4 py-4">
                    <p class="font-medium">{{ order.client.name }}</p>
                    <p class="max-w-48 truncate text-xs text-neutral-500">
                      {{ order.client.email }}
                    </p>
                  </td>
                  <td class="px-4 py-4">{{ professionals(order) }}</td>
                  <td class="px-4 py-4">{{ order.resellerId ? 'Revenda' : 'Plataforma' }}</td>
                  <td class="px-4 py-4 text-right font-medium">{{ credits(order) }}</td>
                  <td class="px-4 py-4">
                    <span
                      [class.font-semibold]="isOverdue(order)"
                      [class.text-red-700]="isOverdue(order)"
                      >{{
                        deadline(order) ? (deadline(order) | date: 'dd/MM/yy') : 'Sem prazo'
                      }}</span
                    >
                    @if (isOverdue(order)) {
                      <p class="text-xs text-red-700">Atrasado</p>
                    }
                  </td>
                  <td class="px-4 py-4">
                    <span class="badge">{{ statusLabel(order.status) }}</span>
                  </td>
                  <td class="px-4 py-4 text-right">
                    <a
                      class="btn-secondary inline-flex min-h-11 items-center"
                      [routerLink]="['/admin/orders/manage', order.id]"
                      >Ver detalhes</a
                    >
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </section>

        <section class="grid gap-3 lg:hidden" aria-label="Pedidos">
          @for (order of page()?.items; track order.id) {
            <article class="card !p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <input
                    class="h-5 w-5"
                    type="checkbox"
                    [attr.aria-label]="'Selecionar pedido ' + shortId(order.id)"
                    [checked]="selected().has(order.id)"
                    (change)="toggle(order.id)"
                  />
                  <div>
                    <a
                      class="font-mono text-sm font-semibold"
                      [routerLink]="['/admin/orders/manage', order.id]"
                      >#{{ shortId(order.id) }}</a
                    >
                    <p class="text-xs text-neutral-500">
                      {{ order.createdAt | date: 'dd/MM/yy HH:mm' }}
                    </p>
                  </div>
                </div>
                <span class="badge">{{ statusLabel(order.status) }}</span>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-xs text-neutral-500">Cliente</p>
                  <p class="truncate font-medium">{{ order.client.name }}</p>
                </div>
                <div>
                  <p class="text-xs text-neutral-500">Créditos</p>
                  <p class="font-medium">{{ credits(order) }}</p>
                </div>
                <div>
                  <p class="text-xs text-neutral-500">Profissional</p>
                  <p class="truncate">{{ professionals(order) }}</p>
                </div>
                <div>
                  <p class="text-xs text-neutral-500">Prazo</p>
                  <p [class.text-red-700]="isOverdue(order)">
                    {{ deadline(order) ? (deadline(order) | date: 'dd/MM/yy') : 'Sem prazo' }}
                    {{ isOverdue(order) ? '· Atrasado' : '' }}
                  </p>
                </div>
              </div>
              <a
                class="btn-secondary mt-4 flex min-h-11 w-full items-center justify-center"
                [routerLink]="['/admin/orders/manage', order.id]"
                >Ver pedido completo</a
              >
            </article>
          }
        </section>

        <nav
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          aria-label="Paginação"
        >
          <p class="text-sm text-neutral-500">
            Página {{ page()?.page }} de {{ page()?.totalPages || 1 }} ·
            {{ page()?.total }} resultado(s)
          </p>
          <div class="flex items-center gap-2">
            <select
              class="form-input min-h-11 w-auto"
              aria-label="Itens por página"
              [ngModel]="query().limit"
              (ngModelChange)="changeLimit($event)"
            >
              <option [ngValue]="25">25</option>
              <option [ngValue]="50">50</option>
              <option [ngValue]="100">100</option></select
            ><button
              class="btn-secondary min-h-11"
              type="button"
              [disabled]="query().page <= 1"
              (click)="changePage(query().page - 1)"
            >
              Anterior</button
            ><button
              class="btn-secondary min-h-11"
              type="button"
              [disabled]="query().page >= (page()?.totalPages || 1)"
              (click)="changePage(query().page + 1)"
            >
              Próxima
            </button>
          </div>
        </nav>
      }
      <p class="sr-only" aria-live="polite">{{ announcement() }}</p>
    </main>
  `,
})
export class OrderAdminListPage {
  private readonly api = inject(OrderAdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly queryCodec = inject(OrderAdminQueryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly statuses: OrderStatus[] = [
    'BLOCKED',
    'AWAITING_ASSIGNMENT',
    'PENDING',
    'AWAITING_BRIEF',
    'IN_PROGRESS',
    'REVIEW',
    'COMPLETED',
    'CANCELLED',
    'DISPUTED',
  ];
  readonly skeletons = [1, 2, 3, 4, 5];
  readonly page = signal<OrderAdminPage | null>(null);
  readonly query = signal<OrderAdminQuery>({ ...DEFAULT_ORDER_ADMIN_QUERY });
  readonly loading = signal(true);
  readonly error = signal('');
  readonly announcement = signal('');
  readonly selected = signal(new Set<string>());
  readonly online = signal(typeof navigator === 'undefined' ? true : navigator.onLine);
  draft: OrderAdminQuery = { ...DEFAULT_ORDER_ADMIN_QUERY };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.online.set(true));
      window.addEventListener('offline', () => this.online.set(false));
    }
    this.route.queryParamMap
      .pipe(
        map((params) => this.queryCodec.parse(params)),
        tap((query) => {
          this.query.set(query);
          this.draft = { ...query };
          this.loading.set(true);
          this.error.set('');
        }),
        switchMap((query) =>
          this.api.list(query).pipe(
            catchError((error: Error) => {
              this.error.set(error.message || 'Erro inesperado');
              return of(null);
            }),
            finalize(() => this.loading.set(false)),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        if (!page) return;
        this.page.set(page);
        this.announcement.set(`${page.total} pedidos carregados`);
        this.selected.set(new Set());
      });
  }

  applyFilters(): void {
    if (this.draft.startDate && this.draft.endDate && this.draft.startDate > this.draft.endDate) {
      this.error.set('A data inicial não pode ser posterior à data final.');
      return;
    }
    this.navigate({ ...this.draft, q: this.draft.q.trim(), page: 1 });
  }
  clearFilters(): void {
    this.navigate({ ...DEFAULT_ORDER_ADMIN_QUERY });
  }
  reload(): void {
    this.navigate({ ...this.query() }, true);
  }
  changePage(page: number): void {
    this.navigate({ ...this.query(), page });
  }
  changeLimit(limit: number): void {
    this.navigate({ ...this.query(), limit, page: 1 });
  }
  private navigate(query: OrderAdminQuery, replaceUrl = false): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.queryCodec.serialize(query),
      replaceUrl,
    });
  }
  currentUrl(): string {
    return this.router.url;
  }
  statusLabel(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status] ?? status;
  }
  shortId(id: string): string {
    return id.slice(0, 8).toUpperCase();
  }
  credits(order: OrderAdminOrder): number {
    return order.lineItems.reduce((sum, item) => sum + item.creditCost, 0);
  }
  professionals(order: OrderAdminOrder): string {
    const names = [
      ...new Set(order.lineItems.map((item) => item.professional?.name).filter(Boolean)),
    ];
    return names.join(', ') || 'Não atribuído';
  }
  deadline(order: OrderAdminOrder): string | null {
    const values = order.lineItems
      .map((item) => item.deadlineAt)
      .filter((value): value is string => Boolean(value))
      .sort();
    return values[0] ?? null;
  }
  isOverdue(order: OrderAdminOrder): boolean {
    const date = this.deadline(order);
    return Boolean(
      date &&
      new Date(date).getTime() < Date.now() &&
      !['COMPLETED', 'CANCELLED'].includes(order.status),
    );
  }
  overdueCount(): number {
    return this.page()?.items.filter((order) => this.isOverdue(order)).length ?? 0;
  }
  toggle(id: string): void {
    this.selected.update((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  togglePage(): void {
    const ids = this.page()?.items.map((order) => order.id) ?? [];
    this.selected.set(this.allPageSelected() ? new Set() : new Set(ids));
  }
  allPageSelected(): boolean {
    const items = this.page()?.items ?? [];
    return items.length > 0 && items.every((order) => this.selected().has(order.id));
  }
  clearSelection(): void {
    this.selected.set(new Set());
  }
  exportCsv(selectedOnly = false): void {
    if (typeof document === 'undefined') return;
    const orders = (this.page()?.items ?? []).filter(
      (order) => !selectedOnly || this.selected().has(order.id),
    );
    const rows = [
      ['Pedido', 'Cliente', 'Email', 'Status', 'Origem', 'Créditos', 'Criado em'],
      ...orders.map((order) => [
        order.id,
        order.client.name,
        order.client.email ?? '',
        this.statusLabel(order.status),
        order.resellerId ? 'Revenda' : 'Plataforma',
        String(this.credits(order)),
        order.createdAt,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.announcement.set(`${orders.length} pedidos exportados`);
  }
}
