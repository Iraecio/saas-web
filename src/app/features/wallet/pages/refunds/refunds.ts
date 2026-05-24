import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { WalletService } from '../../services/wallet';
import { RefundRequest, RefundStatus } from '../../../../core/models/wallet.model';

@Component({
  selector: 'app-refunds-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Reembolsos</h1>
          <p class="mt-1 text-sm text-neutral-500">Suas solicitações de reembolso</p>
        </div>
        <a routerLink="../" class="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">← Voltar</a>
      </header>

      <!-- Filtros -->
      <div>
        <select [value]="statusFilter()" (change)="onStatusChange($event)"
          class="form-input text-sm py-1.5 px-3 w-auto">
          <option value="">Todos os status</option>
          <option value="REQUESTED">Solicitado</option>
          <option value="APPROVED">Aprovado</option>
          <option value="PROCESSING">Processando</option>
          <option value="COMPLETED">Concluído</option>
          <option value="REJECTED">Rejeitado</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </div>

      <!-- Tabela -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        @if (loading()) {
          <div class="flex justify-center py-12">
            <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (refunds().length === 0) {
          <p class="text-neutral-500 text-sm text-center py-12">Nenhum reembolso encontrado.</p>
        } @else {
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Crédito</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Motivo</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              @for (refund of refunds(); track refund.id) {
                <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td class="px-6 py-4">
                    <a [routerLink]="['/admin/wallet/credits', refund.creditId]"
                      class="font-mono text-xs text-primary-600 hover:underline">
                      {{ refund.creditId | slice:0:8 }}…
                    </a>
                  </td>
                  <td class="px-6 py-4 text-neutral-700 dark:text-neutral-300 max-w-xs truncate">{{ refund.reason }}</td>
                  <td class="px-6 py-4">
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="statusBadge(refund.status)">
                      {{ statusLabel(refund.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-neutral-500 text-xs">{{ refund.createdAt | date:'dd/MM/yyyy' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </section>
    </div>
  `,
})
export class RefundsListPage implements OnInit {
  private readonly walletService = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  readonly refunds = signal<RefundRequest[]>([]);
  readonly loading = signal(true);
  readonly statusFilter = signal('');

  ngOnInit(): void {
    this.loadRefunds();
  }

  onStatusChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
    this.loadRefunds();
  }

  private loadRefunds(): void {
    this.loading.set(true);
    this.walletService
      .listRefunds({ status: this.statusFilter() || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => { this.refunds.set(r); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  statusBadge(status: RefundStatus): string {
    const map: Record<RefundStatus, string> = {
      REQUESTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      PROCESSING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      CANCELLED: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
    };
    return map[status] ?? 'bg-neutral-100 text-neutral-800';
  }

  statusLabel(status: RefundStatus): string {
    const map: Record<RefundStatus, string> = {
      REQUESTED: 'Solicitado', APPROVED: 'Aprovado', PROCESSING: 'Processando',
      COMPLETED: 'Concluído', REJECTED: 'Rejeitado', CANCELLED: 'Cancelado',
    };
    return map[status] ?? status;
  }
}
