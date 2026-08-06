import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  StockManagementView,
  StockMovement,
  StockMovementType,
} from '../../../../core/models/reseller-credit.model';
import { ResellerCreditService } from '../../services/reseller-credit';

@Component({
  selector: 'app-credit-stock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CurrencyPipe, DatePipe, DecimalPipe],
  template: `
    <div
      class="min-h-full space-y-6 bg-neutral-50 p-4 text-neutral-900 dark:bg-neutral-950 dark:text-white sm:p-6"
    >
      <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-primary-600">
            Gestão de créditos
          </p>
          <h1 class="mt-1 text-2xl font-bold sm:text-3xl">Estoque</h1>
          <p class="mt-1 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
            Acompanhe saldos, reservas, entradas, saídas, custos e pagamentos em um só lugar.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="btn-secondary" type="button" (click)="load()" [disabled]="loading()">
            {{ loading() ? 'Atualizando…' : 'Atualizar dados' }}
          </button>
          <button
            class="btn-secondary"
            type="button"
            (click)="exportCsv()"
            [disabled]="loading() || !data()"
          >
            Exportar CSV
          </button>
        </div>
      </header>

      @if (error()) {
        <div
          class="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          <span>{{ error() }}</span
          ><button type="button" class="font-semibold underline" (click)="load()">
            Tentar novamente
          </button>
        </div>
      }

      @if (loading() && !data()) {
        <div aria-live="polite" class="space-y-5">
          <div
            class="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-700 dark:border-primary-900 dark:bg-primary-950/30 dark:text-primary-300"
          >
            <span
              class="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"
            ></span>
            Carregando o painel de estoque…
          </div>
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            @for (item of [1, 2, 3, 4]; track item) {
              <div class="h-28 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"></div>
            }
          </div>
          <div class="h-80 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
      } @else if (data(); as view) {
        <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article
            class="rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30"
          >
            <span class="text-xs font-medium text-emerald-700 dark:text-emerald-300"
              >Disponível para venda</span
            >
            <strong class="mt-2 block text-3xl">{{
              view.summary.totalAvailable | number: '1.0-0'
            }}</strong>
            <span class="text-xs text-emerald-700/70 dark:text-emerald-300/70"
              >créditos livres</span
            >
          </article>
          <article class="card p-5">
            <span class="text-xs text-neutral-500">Estoque físico</span
            ><strong class="mt-2 block text-3xl">{{
              view.summary.totalStock | number: '1.0-0'
            }}</strong
            ><span class="text-xs text-neutral-500">em todos os lotes</span>
          </article>
          <article
            class="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30"
          >
            <span class="text-xs text-amber-700 dark:text-amber-300">Reservado</span
            ><strong class="mt-2 block text-3xl">{{
              view.summary.reservedCredits | number: '1.0-0'
            }}</strong
            ><span class="text-xs text-amber-700/70 dark:text-amber-300/70"
              >aguardando pagamento</span
            >
          </article>
          <article class="card p-5">
            <span class="text-xs text-neutral-500">Margem acumulada</span
            ><strong class="mt-2 block text-2xl">{{
              view.summary.marginCents / 100 | currency: 'BRL'
            }}</strong
            ><span class="text-xs text-neutral-500"
              >Receita: {{ view.summary.revenueCents / 100 | currency: 'BRL' }}</span
            >
          </article>
        </section>

        <section class="grid gap-3 sm:grid-cols-2">
          <div class="card flex items-center justify-between p-4">
            <div>
              <p class="text-xs text-neutral-500">Total recebido</p>
              <strong class="text-xl"
                >{{ view.summary.totalReceived | number: '1.0-0' }} créditos</strong
              >
            </div>
            <span class="text-2xl" aria-hidden="true">↓</span>
          </div>
          <div class="card flex items-center justify-between p-4">
            <div>
              <p class="text-xs text-neutral-500">Total vendido</p>
              <strong class="text-xl"
                >{{ view.summary.totalSold | number: '1.0-0' }} créditos</strong
              >
            </div>
            <span class="text-2xl" aria-hidden="true">↑</span>
          </div>
        </section>

        <section
          class="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="flex border-b border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              class="px-5 py-3 text-sm font-semibold"
              [class.text-primary-600]="tab() === 'history'"
              [class.border-b-2]="tab() === 'history'"
              [class.border-primary-600]="tab() === 'history'"
              (click)="tab.set('history')"
            >
              Movimentações
            </button>
            <button
              type="button"
              class="px-5 py-3 text-sm font-semibold"
              [class.text-primary-600]="tab() === 'lots'"
              [class.border-b-2]="tab() === 'lots'"
              [class.border-primary-600]="tab() === 'lots'"
              (click)="tab.set('lots')"
            >
              Lotes ({{ view.lots.length }})
            </button>
          </div>

          @if (tab() === 'history') {
            <div
              class="grid gap-3 border-b border-neutral-200 p-4 dark:border-neutral-800 md:grid-cols-2 xl:grid-cols-5"
            >
              <label class="text-xs text-neutral-500 xl:col-span-2"
                >Buscar
                <input
                  class="form-input mt-1 w-full"
                  [(ngModel)]="search"
                  (keyup.enter)="applyFilters()"
                  placeholder="Cliente, pedido, pagamento ou ID"
                />
              </label>
              <label class="text-xs text-neutral-500"
                >Movimento
                <select class="form-input mt-1 w-full" [(ngModel)]="type">
                  <option value="">Todos</option>
                  <option value="ENTRY">Entradas</option>
                  <option value="EXIT">Saídas</option>
                  <option value="RESERVATION">Reservados</option>
                  <option value="RELEASE">Liberados</option>
                  <option value="CONSUMPTION">Consumidos</option>
                </select>
              </label>
              <label class="text-xs text-neutral-500"
                >De<input class="form-input mt-1 w-full" type="date" [(ngModel)]="startDate"
              /></label>
              <label class="text-xs text-neutral-500"
                >Até<input class="form-input mt-1 w-full" type="date" [(ngModel)]="endDate"
              /></label>
              <div class="flex gap-2 md:col-span-2 xl:col-span-5">
                <button
                  class="btn-primary"
                  type="button"
                  (click)="applyFilters()"
                  [disabled]="loading()"
                >
                  Aplicar filtros</button
                ><button
                  class="btn-secondary"
                  type="button"
                  (click)="clearFilters()"
                  [disabled]="loading()"
                >
                  Limpar
                </button>
              </div>
            </div>
            @if (loading()) {
              <div
                class="flex items-center justify-center gap-3 border-b border-neutral-200 p-4 text-sm text-neutral-500 dark:border-neutral-800"
              >
                <span
                  class="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"
                ></span
                >Atualizando movimentações…
              </div>
            }

            @if (view.movements.items.length === 0) {
              <div class="p-12 text-center">
                <p class="font-semibold">Nenhuma movimentação encontrada</p>
                <p class="mt-1 text-sm text-neutral-500">
                  Ajuste os filtros para ampliar a consulta.
                </p>
              </div>
            } @else {
              <div class="hidden overflow-x-auto md:block">
                <table class="w-full min-w-[62rem] text-sm">
                  <thead
                    class="bg-neutral-50 text-left text-xs uppercase text-neutral-500 dark:bg-neutral-800/70"
                  >
                    <tr>
                      <th class="p-4">Data</th>
                      <th class="p-4">Movimento</th>
                      <th class="p-4">Pessoa / referência</th>
                      <th class="p-4 text-right">Créditos</th>
                      <th class="p-4">Pagamento</th>
                      <th class="p-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
                    @for (movement of view.movements.items; track movement.id) {
                      <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td class="p-4 whitespace-nowrap">
                          {{ movement.occurredAt | date: 'dd/MM/yyyy HH:mm' }}
                        </td>
                        <td class="p-4">
                          <span
                            class="rounded-full px-2 py-1 text-xs font-semibold"
                            [class]="badgeClass(movement.type)"
                            >{{ movementLabel(movement.type) }}</span
                          >
                          <p class="mt-2 text-xs text-neutral-500">{{ movement.title }}</p>
                        </td>
                        <td class="p-4">
                          <p class="font-medium">
                            {{ movement.person?.name || movement.person?.email || '—' }}
                          </p>
                          <p class="font-mono text-xs text-neutral-500">
                            {{ shortId(movement.referenceId) }}
                          </p>
                        </td>
                        <td
                          class="p-4 text-right font-bold"
                          [class.text-emerald-600]="
                            movement.type === 'ENTRY' || movement.type === 'RELEASE'
                          "
                          [class.text-red-600]="
                            movement.type === 'EXIT' || movement.type === 'CONSUMPTION'
                          "
                        >
                          {{ sign(movement.type) }}{{ movement.credits | number: '1.0-0' }}
                        </td>
                        <td class="p-4">
                          <p>{{ movement.payment?.method || '—' }}</p>
                          <p class="text-xs text-neutral-500">
                            {{
                              movement.payment
                                ? paymentStatus(movement.payment.status)
                                : 'Sem transação vinculada'
                            }}
                          </p>
                        </td>
                        <td class="p-4 text-right">
                          <button
                            class="text-sm font-semibold text-primary-600 hover:underline"
                            type="button"
                            (click)="selected.set(movement)"
                          >
                            Ver detalhes
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <div class="divide-y divide-neutral-100 dark:divide-neutral-800 md:hidden">
                @for (movement of view.movements.items; track movement.id) {
                  <button
                    type="button"
                    class="block w-full p-4 text-left"
                    (click)="selected.set(movement)"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <span
                          class="rounded-full px-2 py-1 text-xs font-semibold"
                          [class]="badgeClass(movement.type)"
                          >{{ movementLabel(movement.type) }}</span
                        >
                        <p class="mt-2 font-medium">{{ movement.title }}</p>
                        <p class="text-xs text-neutral-500">
                          {{ movement.occurredAt | date: 'dd/MM/yyyy HH:mm' }}
                        </p>
                      </div>
                      <strong
                        [class.text-emerald-600]="
                          movement.type === 'ENTRY' || movement.type === 'RELEASE'
                        "
                        [class.text-red-600]="
                          movement.type === 'EXIT' || movement.type === 'CONSUMPTION'
                        "
                        >{{ sign(movement.type) }}{{ movement.credits }}</strong
                      >
                    </div>
                    <p class="mt-2 text-xs text-neutral-500">
                      {{
                        movement.person?.name ||
                          movement.payment?.method ||
                          shortId(movement.referenceId)
                      }}
                    </p>
                  </button>
                }
              </div>
            }
            <footer
              class="flex flex-col gap-3 border-t border-neutral-200 p-4 text-sm dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <span>{{ view.movements.total }} movimentação(ões)</span>
              <div class="flex items-center gap-2">
                <button
                  class="btn-secondary"
                  type="button"
                  [disabled]="page() <= 1 || loading()"
                  (click)="goToPage(page() - 1)"
                >
                  Anterior</button
                ><span>Página {{ page() }} de {{ view.movements.totalPages }}</span
                ><button
                  class="btn-secondary"
                  type="button"
                  [disabled]="page() >= view.movements.totalPages || loading()"
                  (click)="goToPage(page() + 1)"
                >
                  Próxima
                </button>
              </div>
            </footer>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full min-w-[50rem] text-sm">
                <thead
                  class="bg-neutral-50 text-left text-xs uppercase text-neutral-500 dark:bg-neutral-800/70"
                >
                  <tr>
                    <th class="p-4">Lote / origem</th>
                    <th class="p-4">Criado em</th>
                    <th class="p-4">Saldo</th>
                    <th class="p-4">Utilização</th>
                    <th class="p-4">Custo unitário</th>
                    <th class="p-4">Referência</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
                  @for (lot of view.lots; track lot.id) {
                    <tr>
                      <td class="p-4">
                        <p class="font-semibold">{{ sourceLabel(lot.sourceType) }}</p>
                        <p class="font-mono text-xs text-neutral-500">{{ shortId(lot.id) }}</p>
                      </td>
                      <td class="p-4">{{ lot.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
                      <td class="p-4">
                        <strong>{{ lot.remainingCredits | number }}</strong> /
                        {{ lot.initialCredits | number }}
                      </td>
                      <td class="p-4">
                        <div
                          class="h-2 w-32 overflow-hidden rounded bg-neutral-200 dark:bg-neutral-700"
                        >
                          <div
                            class="h-full bg-primary-600"
                            [style.width.%]="
                              lot.initialCredits
                                ? ((lot.initialCredits - lot.remainingCredits) /
                                    lot.initialCredits) *
                                  100
                                : 0
                            "
                          ></div>
                        </div>
                        <p class="mt-1 text-xs text-neutral-500">
                          {{ lot.initialCredits - lot.remainingCredits }} utilizados
                        </p>
                      </td>
                      <td class="p-4">{{ lot.unitCostCents / 100 | currency: 'BRL' }}</td>
                      <td class="p-4 font-mono text-xs">
                        {{ shortId(lot.purchaseId || lot.referenceId) }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      }
    </div>

    @if (selected(); as movement) {
      <div
        class="fixed inset-0 z-50 flex items-end justify-end bg-black/50 sm:items-stretch"
        (click)="selected.set(null)"
      >
        <aside
          class="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900 sm:max-h-none sm:max-w-lg sm:rounded-none"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase text-primary-600">
                Detalhes da movimentação
              </p>
              <h2 class="mt-1 text-xl font-bold">{{ movement.title }}</h2>
            </div>
            <button
              class="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              type="button"
              aria-label="Fechar"
              (click)="selected.set(null)"
            >
              ✕
            </button>
          </div>
          <dl class="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt class="text-neutral-500">Tipo</dt>
              <dd class="mt-1 font-semibold">{{ movementLabel(movement.type) }}</dd>
            </div>
            <div>
              <dt class="text-neutral-500">Créditos</dt>
              <dd class="mt-1 text-lg font-bold">{{ movement.credits | number }}</dd>
            </div>
            <div>
              <dt class="text-neutral-500">Data</dt>
              <dd class="mt-1">{{ movement.occurredAt | date: 'dd/MM/yyyy HH:mm' }}</dd>
            </div>
            <div>
              <dt class="text-neutral-500">Status</dt>
              <dd class="mt-1">{{ movement.status || '—' }}</dd>
            </div>
          </dl>
          <section class="mt-6 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
            <h3 class="font-semibold">Referência</h3>
            <p class="mt-2 text-xs text-neutral-500">
              {{ movement.referenceType || 'Movimentação' }}
            </p>
            <p class="break-all font-mono text-xs">{{ movement.referenceId || '—' }}</p>
            @if (movement.lotId) {
              <p class="mt-3 text-xs text-neutral-500">Lote</p>
              <p class="break-all font-mono text-xs">{{ movement.lotId }}</p>
            }
          </section>
          @if (movement.person) {
            <section class="mt-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
              <h3 class="font-semibold">Pessoa relacionada</h3>
              <p class="mt-2">{{ movement.person.name || 'Sem nome informado' }}</p>
              <p class="text-sm text-neutral-500">{{ movement.person.email }}</p>
            </section>
          }
          @if (movement.financial; as financial) {
            <section class="mt-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
              <h3 class="font-semibold">Valores financeiros</h3>
              <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt class="text-neutral-500">Valor unitário</dt>
                  <dd>{{ financial.unitCents / 100 | currency: 'BRL' }}</dd>
                </div>
                <div>
                  <dt class="text-neutral-500">Total</dt>
                  <dd>{{ financial.totalCents / 100 | currency: 'BRL' }}</dd>
                </div>
                @if (financial.costCents !== undefined) {
                  <div>
                    <dt class="text-neutral-500">Custo</dt>
                    <dd>{{ financial.costCents / 100 | currency: 'BRL' }}</dd>
                  </div>
                }
                @if (financial.marginCents !== undefined) {
                  <div>
                    <dt class="text-neutral-500">Margem</dt>
                    <dd>{{ financial.marginCents / 100 | currency: 'BRL' }}</dd>
                  </div>
                }
              </dl>
            </section>
          }
          @if (movement.payment; as payment) {
            <section class="mt-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
              <h3 class="font-semibold">Pagamento</h3>
              <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt class="text-neutral-500">Meio</dt>
                  <dd>{{ payment.method }}</dd>
                </div>
                <div>
                  <dt class="text-neutral-500">Status</dt>
                  <dd>{{ paymentStatus(payment.status) }}</dd>
                </div>
                <div>
                  <dt class="text-neutral-500">Valor</dt>
                  <dd>{{ payment.amountCents / 100 | currency: 'BRL' }}</dd>
                </div>
                <div>
                  <dt class="text-neutral-500">Pago em</dt>
                  <dd>{{ payment.paidAt ? (payment.paidAt | date: 'dd/MM/yyyy HH:mm') : '—' }}</dd>
                </div>
              </dl>
              <p class="mt-3 text-xs text-neutral-500">Transação</p>
              <p class="break-all font-mono text-xs">{{ payment.transactionId }}</p>
              @if (payment.proofs?.length) {
                <div class="mt-4 border-t border-neutral-200 pt-3 dark:border-neutral-700">
                  <p class="text-xs font-semibold uppercase text-neutral-500">Comprovantes</p>
                  @for (proof of payment.proofs; track proof.id) {
                    <p class="mt-2 text-sm">
                      {{ proof.originalName }}
                      <span class="text-xs text-neutral-500">({{ proof.status }})</span>
                    </p>
                  }
                </div>
              }
            </section>
          }
        </aside>
      </div>
    }
  `,
})
export class CreditStockPage {
  private readonly service = inject(ResellerCreditService);
  private readonly destroyRef = inject(DestroyRef);
  readonly data = signal<StockManagementView | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly page = signal(1);
  readonly tab = signal<'history' | 'lots'>('history');
  readonly selected = signal<StockMovement | null>(null);
  search = '';
  type: StockMovementType | '' = '';
  startDate = '';
  endDate = '';

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.service
      .getStockManagement({
        page: this.page(),
        limit: 20,
        type: this.type || undefined,
        search: this.search || undefined,
        startDate: this.startDate || undefined,
        endDate: this.endDate || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (view) => {
          this.data.set(view);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(error?.message || 'Não foi possível carregar o estoque.');
          this.loading.set(false);
        },
      });
  }
  applyFilters(): void {
    this.page.set(1);
    this.load();
  }
  clearFilters(): void {
    this.search = '';
    this.type = '';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }
  goToPage(page: number): void {
    this.page.set(page);
    this.load();
  }
  shortId(id?: string | null): string {
    return id ? `${id.slice(0, 8)}…` : '—';
  }
  sign(type: StockMovementType): string {
    return type === 'ENTRY' || type === 'RELEASE' ? '+' : type === 'RESERVATION' ? '' : '−';
  }
  movementLabel(type: StockMovementType): string {
    return {
      ENTRY: 'Entrada',
      EXIT: 'Saída',
      RESERVATION: 'Reservado',
      RELEASE: 'Liberado',
      CONSUMPTION: 'Consumido',
    }[type];
  }
  badgeClass(type: StockMovementType): string {
    return {
      ENTRY: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      EXIT: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
      RESERVATION: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      RELEASE: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      CONSUMPTION: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    }[type];
  }
  sourceLabel(source: string): string {
    return (
      {
        PURCHASE: 'Compra',
        DIRECT_PURCHASE: 'Compra direta',
        ORDER_RETURN: 'Retorno de pedido',
        EXPIRATION_RETURN: 'Retorno por expiração',
      }[source] || source
    );
  }
  paymentStatus(status: string): string {
    return (
      {
        CREATED: 'Criado',
        AWAITING_PAYMENT: 'Aguardando pagamento',
        AWAITING_REVIEW: 'Em análise',
        PROCESSING: 'Processando',
        PAID: 'Pago',
        DECLINED: 'Recusado',
        EXPIRED: 'Expirado',
        CANCELLED: 'Cancelado',
        REFUNDED: 'Estornado',
        DISPUTED: 'Em disputa',
        DIVERGENT: 'Divergente',
      }[status] || status
    );
  }
  exportCsv(): void {
    this.loading.set(true);
    this.error.set('');
    this.service
      .getStockManagement({
        page: 1,
        limit: 100,
        type: this.type || undefined,
        search: this.search || undefined,
        startDate: this.startDate || undefined,
        endDate: this.endDate || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (view) => {
          this.downloadCsv(view.movements.items);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(error?.message || 'Não foi possível gerar o relatório.');
          this.loading.set(false);
        },
      });
  }

  private downloadCsv(items: StockMovement[]): void {
    const rows = [
      ['Data', 'Tipo', 'Descrição', 'Créditos', 'Pessoa', 'Referência', 'Pagamento', 'Valor'],
      ...items.map((item) => [
        new Date(item.occurredAt).toLocaleString('pt-BR'),
        this.movementLabel(item.type),
        item.title,
        String(item.credits),
        item.person?.name || item.person?.email || '',
        item.referenceId || '',
        item.payment?.method || '',
        item.financial ? (item.financial.totalCents / 100).toFixed(2).replace('.', ',') : '',
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(';'))
      .join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `estoque-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
