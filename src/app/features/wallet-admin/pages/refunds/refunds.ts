import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { WalletAdminService } from '../../services/wallet-admin';
import { RefundRequest, RefundStatus } from '../../../../core/models/wallet.model';

@Component({
  selector: 'app-refunds-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Reembolsos</h1>
        <p class="mt-1 text-sm text-neutral-500">Aprovar ou rejeitar solicitações de reembolso</p>
      </header>

      <!-- Filtro -->
      <select [value]="statusFilter()" (change)="onStatusChange($event)" class="form-input text-sm w-auto">
        <option value="">Todos os status</option>
        <option value="REQUESTED">Solicitado</option>
        <option value="APPROVED">Aprovado</option>
        <option value="PROCESSING">Processando</option>
        <option value="COMPLETED">Concluído</option>
        <option value="REJECTED">Rejeitado</option>
        <option value="CANCELLED">Cancelado</option>
      </select>

      <!-- Modal ação -->
      @if (actionModal()) {
        <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 max-w-md w-full space-y-4">
            <h3 class="text-lg font-bold text-neutral-900 dark:text-white">
              {{ actionModal()!.action === 'approve' ? 'Aprovar Reembolso' : 'Rejeitar Reembolso' }}
            </h3>
            <form [formGroup]="actionForm" (ngSubmit)="submitAction()" class="space-y-4">
              @if (actionModal()!.action === 'approve') {
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Observações (opcional)</label>
                  <textarea formControlName="field" rows="3" class="form-input w-full text-sm"
                    placeholder="Adicione observações sobre a aprovação..."></textarea>
                </div>
              } @else {
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Motivo da rejeição *</label>
                  <textarea formControlName="field" rows="3" class="form-input w-full text-sm"
                    placeholder="Informe o motivo da rejeição..." required></textarea>
                </div>
              }
              @if (actionError()) {
                <p class="text-sm text-red-500">{{ actionError() }}</p>
              }
              <div class="flex justify-end gap-3">
                <button type="button" (click)="actionModal.set(null)"
                  class="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400">Cancelar</button>
                <button type="submit" [disabled]="acting() || (actionModal()!.action === 'reject' && !actionForm.getRawValue().field)"
                  class="px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50 transition-opacity"
                  [class]="actionModal()!.action === 'approve' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'">
                  {{ acting() ? 'Processando...' : (actionModal()!.action === 'approve' ? 'Aprovar' : 'Rejeitar') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Tabela -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        @if (loading()) {
          <div class="flex justify-center py-12">
            <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (refunds().length === 0) {
          <p class="text-sm text-neutral-500 text-center py-12">Nenhum reembolso encontrado.</p>
        } @else {
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Crédito</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Usuário</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Motivo</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Data</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              @for (refund of refunds(); track refund.id) {
                <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td class="px-4 py-3 font-mono text-xs text-neutral-500">{{ refund.creditId | slice:0:8 }}…</td>
                  <td class="px-4 py-3 font-mono text-xs text-neutral-500">{{ refund.requestedBy | slice:0:8 }}…</td>
                  <td class="px-4 py-3 text-neutral-700 dark:text-neutral-300 max-w-xs truncate">{{ refund.reason }}</td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="statusBadge(refund.status)">
                      {{ refund.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-neutral-500 text-xs">{{ refund.createdAt | date:'dd/MM/yyyy' }}</td>
                  <td class="px-4 py-3">
                    @if (refund.status === 'REQUESTED') {
                      <div class="flex items-center gap-2">
                        <button (click)="openAction(refund, 'approve')"
                          class="text-xs text-green-600 hover:text-green-800 font-medium">Aprovar</button>
                        <button (click)="openAction(refund, 'reject')"
                          class="text-xs text-red-500 hover:text-red-700 font-medium">Rejeitar</button>
                      </div>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </section>
    </div>
  `,
})
export class RefundsAdminPage implements OnInit {
  private readonly walletAdminService = inject(WalletAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly refunds = signal<RefundRequest[]>([]);
  readonly loading = signal(true);
  readonly statusFilter = signal('');
  readonly actionModal = signal<{ refund: RefundRequest; action: 'approve' | 'reject' } | null>(null);
  readonly acting = signal(false);
  readonly actionError = signal<string | undefined>(undefined);

  readonly actionForm = this.fb.nonNullable.group({ field: [''] });

  ngOnInit(): void {
    this.loadRefunds();
  }

  onStatusChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
    this.loadRefunds();
  }

  openAction(refund: RefundRequest, action: 'approve' | 'reject'): void {
    this.actionModal.set({ refund, action });
    this.actionError.set(undefined);
    this.actionForm.reset();
  }

  submitAction(): void {
    const modal = this.actionModal();
    if (!modal) return;
    this.acting.set(true);
    this.actionError.set(undefined);

    const field = this.actionForm.getRawValue().field;
    const obs$ =
      modal.action === 'approve'
        ? this.walletAdminService.approveRefund(modal.refund.id, field || undefined)
        : this.walletAdminService.rejectRefund(modal.refund.id, field);

    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.acting.set(false);
        this.actionModal.set(null);
        this.loadRefunds();
      },
      error: (err: Error) => {
        this.acting.set(false);
        this.actionError.set(err.message ?? 'Erro ao processar reembolso');
      },
    });
  }

  private loadRefunds(): void {
    this.loading.set(true);
    this.walletAdminService
      .listAllRefunds({ status: this.statusFilter() || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => { this.refunds.set(r); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  statusBadge(status: RefundStatus): string {
    const map: Record<RefundStatus, string> = {
      REQUESTED: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      PROCESSING: 'bg-amber-100 text-amber-800',
      COMPLETED: 'bg-emerald-100 text-emerald-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-neutral-100 text-neutral-600',
    };
    return map[status] ?? 'bg-neutral-100 text-neutral-800';
  }
}
