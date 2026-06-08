import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../../../core/services/notification';
import { WithdrawalService } from '../../services/withdrawal';
import { WITHDRAWAL_STATUS_LABELS } from '../../withdrawal-status.util';
import { WithdrawalRequest, WithdrawalStatus } from '../../../../core/models/withdrawal.model';

@Component({
  selector: 'app-admin-withdrawals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Saques (administração)</h1>
        <p class="mt-1 text-sm text-neutral-500">Processe e confirme pagamentos de saque</p>
      </header>

      <select class="form-input sm:w-56" [value]="statusFilter()" (change)="onStatus($any($event.target).value)">
        <option value="">Todos os status</option>
        <option value="PENDING">Pendente</option>
        <option value="PROCESSING">Processando</option>
        <option value="COMPLETED">Concluído</option>
        <option value="REJECTED">Rejeitado</option>
      </select>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (withdrawals().length === 0) {
        <p class="py-12 text-center text-sm text-neutral-500">Nenhum saque encontrado.</p>
      } @else {
        <ul class="space-y-2">
          @for (w of withdrawals(); track w.id) {
            <li class="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-sm font-medium">{{ w.creditAmount }} créditos — R$ {{ (w.amountCents / 100) | number: '1.2-2' }}</span>
                  <p class="text-xs text-neutral-500">{{ w.requestedAt | date: 'short' }} · {{ statusLabel(w.status) }}</p>
                </div>
                <div class="flex gap-2">
                  @if (w.status === 'PENDING') {
                    <button class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800" (click)="process(w)">Processar</button>
                    <button class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800" (click)="openReject(w)">Rejeitar</button>
                  }
                  @if (w.status === 'PROCESSING') {
                    <button class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800" (click)="openComplete(w)">Confirmar pagamento</button>
                    <button class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800" (click)="openReject(w)">Rejeitar</button>
                  }
                </div>
              </div>

              @if (completeTarget() === w.id) {
                <div class="mt-3 flex gap-2">
                  <input class="form-input flex-1" placeholder="Referência do pagamento (PIX, TED...)" [value]="paymentRef()" (input)="paymentRef.set($any($event.target).value)" />
                  <button class="btn-primary" [disabled]="!paymentRef().trim()" (click)="complete(w)">Confirmar</button>
                </div>
              }
              @if (rejectTarget() === w.id) {
                <div class="mt-3 flex gap-2">
                  <input class="form-input flex-1" placeholder="Motivo da rejeição" [value]="rejectReason()" (input)="rejectReason.set($any($event.target).value)" />
                  <button class="btn-primary" [disabled]="!rejectReason().trim()" (click)="reject(w)">Rejeitar</button>
                </div>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class AdminWithdrawalsPage {
  private readonly svc = inject(WithdrawalService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly statusFilter = signal<WithdrawalStatus | ''>('');
  readonly withdrawals = signal<WithdrawalRequest[]>([]);
  readonly loading = signal(true);

  readonly completeTarget = signal<string | null>(null);
  readonly rejectTarget = signal<string | null>(null);
  readonly paymentRef = signal('');
  readonly rejectReason = signal('');

  constructor() {
    this.load();
  }

  statusLabel(status: WithdrawalStatus): string {
    return WITHDRAWAL_STATUS_LABELS[status] ?? status;
  }

  onStatus(value: string): void {
    this.statusFilter.set((value as WithdrawalStatus) || '');
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.svc
      .list({ status: this.statusFilter() || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.withdrawals.set(list);
          this.loading.set(false);
        },
        error: (err) => {
          this.notify.error(err.message ?? 'Erro ao carregar saques');
          this.loading.set(false);
        },
      });
  }

  process(w: WithdrawalRequest): void {
    this.svc.process(w.id).subscribe({
      next: () => {
        this.notify.success('Saque em processamento.');
        this.load();
      },
      error: (err) => this.notify.error(err.message ?? 'Erro ao processar'),
    });
  }

  openComplete(w: WithdrawalRequest): void {
    this.completeTarget.set(w.id);
    this.rejectTarget.set(null);
    this.paymentRef.set('');
  }

  openReject(w: WithdrawalRequest): void {
    this.rejectTarget.set(w.id);
    this.completeTarget.set(null);
    this.rejectReason.set('');
  }

  complete(w: WithdrawalRequest): void {
    if (!this.paymentRef().trim()) return;
    this.svc.complete(w.id, { paymentReference: this.paymentRef().trim() }).subscribe({
      next: () => {
        this.completeTarget.set(null);
        this.notify.success('Pagamento confirmado.');
        this.load();
      },
      error: (err) => this.notify.error(err.message ?? 'Erro ao confirmar'),
    });
  }

  reject(w: WithdrawalRequest): void {
    if (!this.rejectReason().trim()) return;
    this.svc.reject(w.id, { reason: this.rejectReason().trim() }).subscribe({
      next: () => {
        this.rejectTarget.set(null);
        this.notify.success('Saque rejeitado.');
        this.load();
      },
      error: (err) => this.notify.error(err.message ?? 'Erro ao rejeitar'),
    });
  }
}
