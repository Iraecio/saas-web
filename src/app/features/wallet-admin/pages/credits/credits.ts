import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import { WalletAdminService } from '../../services/wallet-admin';
import { Credit, CreditStatus } from '../../../../core/models/wallet.model';

@Component({
  selector: 'app-credits-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, SlicePipe],
  template: `
    <div class="p-6 max-w-6xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Busca de Créditos</h1>
        <p class="mt-1 text-sm text-neutral-500">Filtre e explore créditos de todos os usuários</p>
      </header>

      <!-- Filtros -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input type="text" [value]="filters.userId" (input)="onInput($event, 'userId')"
          placeholder="User ID" class="form-input text-sm" />
        <select [value]="filters.status" (change)="onSelect($event, 'status')" class="form-input text-sm">
          <option value="">Todos os status</option>
          <option value="AVAILABLE">Disponível</option>
          <option value="FROZEN">Congelado</option>
          <option value="SPENT">Gasto</option>
          <option value="CANCELLED">Cancelado</option>
          <option value="REFUNDED">Reembolsado</option>
          <option value="EXPIRED">Expirado</option>
        </select>
        <select [value]="filters.type" (change)="onSelect($event, 'type')" class="form-input text-sm">
          <option value="">Todos os tipos</option>
          <option value="PAID">Pago</option>
          <option value="PROMOTIONAL">Promocional</option>
          <option value="EARNED">Ganho</option>
          <option value="BONUS">Bônus</option>
        </select>
        <select [value]="filters.originType" (change)="onSelect($event, 'originType')" class="form-input text-sm">
          <option value="">Todas as origens</option>
          <option value="PURCHASE">Compra</option>
          <option value="SERVICE_PAYMENT">Serviço</option>
          <option value="ADJUSTMENT">Ajuste</option>
          <option value="PROMOTION">Promoção</option>
          <option value="BONUS">Bônus</option>
        </select>
      </div>
      <button (click)="search()" class="px-4 py-2 text-sm bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:opacity-90 transition-opacity">
        Buscar
      </button>

      <!-- Resultados -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        @if (loading()) {
          <div class="flex justify-center py-12">
            <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (credits().length === 0) {
          <p class="text-sm text-neutral-500 text-center py-12">Nenhum crédito encontrado.</p>
        } @else {
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">ID</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Valor</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Tipo</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Origem</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Criado em</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              @for (credit of credits(); track credit.id) {
                <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td class="px-4 py-3 font-mono text-xs text-neutral-500">{{ credit.id | slice:0:8 }}…</td>
                  <td class="px-4 py-3 font-semibold text-neutral-900 dark:text-white">{{ credit.amount | number:'1.2-2' }}</td>
                  <td class="px-4 py-3 text-neutral-700 dark:text-neutral-300">{{ credit.type }}</td>
                  <td class="px-4 py-3 text-neutral-700 dark:text-neutral-300">{{ credit.originType }}</td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="statusBadge(credit.status)">
                      {{ credit.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-neutral-500 text-xs">{{ credit.createdAt | date:'dd/MM/yyyy' }}</td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Paginação -->
          <div class="flex items-center justify-between px-4 py-4 border-t border-neutral-200 dark:border-neutral-800">
            <button (click)="prevPage()" [disabled]="currentPage() === 1"
              class="text-sm px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              ← Anterior
            </button>
            <span class="text-sm text-neutral-500">Página {{ currentPage() }}</span>
            <button (click)="nextPage()" [disabled]="credits().length < pageSize"
              class="text-sm px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              Próxima →
            </button>
          </div>
        }
      </section>
    </div>
  `,
})
export class CreditsSearchPage implements OnInit {
  private readonly walletAdminService = inject(WalletAdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly credits = signal<Credit[]>([]);
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = 20;

  filters: { userId: string; status: string; type: string; originType: string } = {
    userId: '',
    status: '',
    type: '',
    originType: '',
  };

  ngOnInit(): void {
    const userId = this.route.snapshot.queryParamMap.get('userId');
    if (userId) this.filters.userId = userId;
    this.search();
  }

  onInput(event: Event, field: 'userId'): void {
    this.filters[field] = (event.target as HTMLInputElement).value;
  }

  onSelect(event: Event, field: 'status' | 'type' | 'originType'): void {
    this.filters[field] = (event.target as HTMLSelectElement).value;
  }

  search(): void {
    this.currentPage.set(1);
    this.loadCredits();
  }

  nextPage(): void {
    this.currentPage.update((p) => p + 1);
    this.loadCredits();
  }

  prevPage(): void {
    if (this.currentPage() <= 1) return;
    this.currentPage.update((p) => p - 1);
    this.loadCredits();
  }

  private loadCredits(): void {
    this.loading.set(true);
    this.walletAdminService
      .searchCredits({
        userId: this.filters.userId || undefined,
        status: this.filters.status || undefined,
        type: this.filters.type || undefined,
        originType: this.filters.originType || undefined,
        page: this.currentPage(),
        limit: this.pageSize,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (c) => { this.credits.set(c); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  statusBadge(status: CreditStatus): string {
    const map: Record<CreditStatus, string> = {
      AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      FROZEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      SPENT: 'bg-neutral-100 text-neutral-600',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-amber-100 text-amber-800',
      EXPIRED: 'bg-neutral-100 text-neutral-500',
    };
    return map[status] ?? 'bg-neutral-100 text-neutral-800';
  }
}
