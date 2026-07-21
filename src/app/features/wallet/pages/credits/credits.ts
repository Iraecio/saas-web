import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WalletService } from '../../services/wallet';
import { Credit, CreditStatus, CreditType } from '../../../../core/models/wallet.model';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-credits-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, DecimalPipe, TitleCasePipe],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Créditos</h1>
          <p class="mt-1 text-sm text-neutral-500">Histórico de créditos da sua carteira</p>
        </div>
        <a routerLink="../" class="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">← Voltar</a>
      </header>

      <!-- Filtros -->
      <div class="flex gap-3 flex-wrap">
        <select [value]="statusFilter()" (change)="onStatusChange($event)"
          class="form-input text-sm py-1.5 px-3 w-auto">
          <option value="">Todos os status</option>
          <option value="AVAILABLE">Disponível</option>
          <option value="FROZEN">Congelado</option>
          <option value="SPENT">Gasto</option>
          <option value="CANCELLED">Cancelado</option>
          <option value="REFUNDED">Reembolsado</option>
          <option value="EXPIRED">Expirado</option>
        </select>

        <select [value]="typeFilter()" (change)="onTypeChange($event)"
          class="form-input text-sm py-1.5 px-3 w-auto">
          <option value="">Todos os tipos</option>
          <option value="PAID">Pago</option>
          <option value="PROMOTIONAL">Promocional</option>
          <option value="EARNED">Ganho</option>
          <option value="BONUS">Bônus</option>
        </select>
      </div>

      <!-- Lista -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        @if (loading()) {
          <div class="flex justify-center py-12">
            <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (credits().length === 0) {
          <p class="text-neutral-500 text-sm text-center py-12">Nenhum crédito encontrado.</p>
        } @else {
          <div class="divide-y divide-neutral-200 dark:divide-neutral-800">
            @for (credit of credits(); track credit.id) {
              <a [routerLink]="[credit.id]" class="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    [class]="creditIconBg(credit.status)">
                    {{ creditIcon(credit.type) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-neutral-900 dark:text-white">
                      {{ credit.type | titlecase }} · {{ credit.originType | titlecase }}
                    </p>
                    <p class="text-xs text-neutral-500 mt-0.5">
                      {{ credit.issuedAt | date:'dd/MM/yyyy' }}
                      @if (credit.expiresAt) { · Expira {{ credit.expiresAt | date:'dd/MM/yyyy' }} }
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-semibold" [class]="amountClass(credit.status)">
                    {{ credit.valueCents / 100 | number:'1.2-2' }}
                  </span>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="statusBadgeClass(credit.status)">
                    {{ statusLabel(credit.status) }}
                  </span>
                </div>
              </a>
            }
          </div>

          @if (hasMore()) {
            <div class="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 text-center">
              <button (click)="loadMore()" [disabled]="loadingMore()"
                class="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors">
                {{ loadingMore() ? 'Carregando...' : 'Carregar mais' }}
              </button>
            </div>
          }
        }
      </section>
    </div>
  `,
})
export class CreditsListPage implements OnInit {
  private readonly walletService = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  readonly credits = signal<Credit[]>([]);
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly hasMore = signal(false);
  readonly nextCursor = signal<string | undefined>(undefined);
  readonly statusFilter = signal('');
  readonly typeFilter = signal('');

  ngOnInit(): void {
    this.loadCredits(true);
  }

  onStatusChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
    this.loadCredits(true);
  }

  onTypeChange(event: Event): void {
    this.typeFilter.set((event.target as HTMLSelectElement).value);
    this.loadCredits(true);
  }

  loadMore(): void {
    if (!this.hasMore() || this.loadingMore()) return;
    this.loadingMore.set(true);
    this.walletService
      .listCredits({
        cursor: this.nextCursor(),
        status: this.statusFilter() || undefined,
        type: this.typeFilter() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.credits.update((c) => [...c, ...res.items]);
          this.hasMore.set(Boolean(res.nextCursor));
          this.nextCursor.set(res.nextCursor ?? undefined);
          this.loadingMore.set(false);
        },
        error: () => this.loadingMore.set(false),
      });
  }

  private loadCredits(reset: boolean): void {
    if (reset) {
      this.loading.set(true);
      this.credits.set([]);
      this.nextCursor.set(undefined);
    }
    this.walletService
      .listCredits({
        status: this.statusFilter() || undefined,
        type: this.typeFilter() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.credits.set(res.items);
          this.hasMore.set(Boolean(res.nextCursor));
          this.nextCursor.set(res.nextCursor ?? undefined);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  creditIcon(type: CreditType): string {
    const map: Record<CreditType, string> = {
      PAID: '💳', PROMOTIONAL: '🎁', EARNED: '⭐', BONUS: '🎉',
    };
    return map[type] ?? '💰';
  }

  creditIconBg(status: CreditStatus): string {
    const map: Record<CreditStatus, string> = {
      AVAILABLE: 'bg-green-100 dark:bg-green-900/30',
      FROZEN: 'bg-blue-100 dark:bg-blue-900/30',
      SPENT: 'bg-neutral-100 dark:bg-neutral-800',
      CANCELLED: 'bg-red-100 dark:bg-red-900/30',
      REFUNDED: 'bg-amber-100 dark:bg-amber-900/30',
      EXPIRED: 'bg-neutral-100 dark:bg-neutral-800',
    };
    return map[status] ?? 'bg-neutral-100';
  }

  amountClass(status: CreditStatus): string {
    if (status === 'AVAILABLE') return 'text-green-600 dark:text-green-400';
    if (status === 'SPENT' || status === 'EXPIRED' || status === 'CANCELLED') return 'text-neutral-400';
    return 'text-neutral-900 dark:text-white';
  }

  statusBadgeClass(status: CreditStatus): string {
    const map: Record<CreditStatus, string> = {
      AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      FROZEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      SPENT: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      REFUNDED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      EXPIRED: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500',
    };
    return map[status] ?? 'bg-neutral-100 text-neutral-800';
  }

  statusLabel(status: CreditStatus): string {
    const map: Record<CreditStatus, string> = {
      AVAILABLE: 'Disponível', FROZEN: 'Congelado', SPENT: 'Gasto',
      CANCELLED: 'Cancelado', REFUNDED: 'Reembolsado', EXPIRED: 'Expirado',
    };
    return map[status] ?? status;
  }
}
