import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppStateService } from '../../../../core/services/app-state';
import { NotificationService } from '../../../../core/services/notification';
import { WalletService } from '../../../wallet/services/wallet';
import { WithdrawalService } from '../../services/withdrawal';
import { WITHDRAWAL_STATUS_LABELS } from '../../withdrawal-status.util';
import { WithdrawalRequest } from '../../../../core/models/withdrawal.model';

const MIN_CREDITS = 300;

@Component({
  selector: 'app-my-withdrawals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Meus saques</h1>
        <p class="mt-1 text-sm text-neutral-500">Saque dos seus créditos acumulados (R$1,00 por crédito)</p>
      </header>

      @if (isParticular()) {
        <div class="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          Profissionais particulares são pagos diretamente pela revenda, fora da plataforma.
        </div>
      } @else {
        <section class="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
          <p class="text-sm text-neutral-500">Créditos acumulados</p>
          <p class="text-4xl font-bold text-neutral-900 dark:text-white">{{ accumulated() | number }}</p>
          @if (accumulated() >= minCredits) {
            <button type="button" class="btn-primary mt-4" [disabled]="requesting()" (click)="request()">
              {{ requesting() ? 'Solicitando...' : 'Solicitar saque (300 créditos)' }}
            </button>
          } @else {
            <p class="mt-3 text-sm text-amber-600">
              Faltam {{ minCredits - accumulated() | number }} créditos para o mínimo de {{ minCredits }}.
            </p>
          }
        </section>
      }

      <section>
        <h2 class="mb-3 text-lg font-semibold">Histórico</h2>
        @if (loading()) {
          <p class="text-sm text-neutral-500">Carregando...</p>
        } @else if (withdrawals().length === 0) {
          <p class="text-sm text-neutral-500">Nenhuma solicitação ainda.</p>
        } @else {
          <ul class="space-y-2">
            @for (w of withdrawals(); track w.id) {
              <li class="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
                <div>
                  <span class="text-sm font-medium">{{ w.creditAmount }} créditos — R$ {{ (w.amountCents / 100) | number: '1.2-2' }}</span>
                  <p class="text-xs text-neutral-500">{{ w.requestedAt | date: 'short' }}</p>
                </div>
                <span class="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {{ statusLabel(w.status) }}
                </span>
              </li>
            }
          </ul>
        }
      </section>
    </div>
  `,
})
export class MyWithdrawalsPage {
  private readonly svc = inject(WithdrawalService);
  private readonly wallet = inject(WalletService);
  private readonly appState = inject(AppStateService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly minCredits = MIN_CREDITS;
  readonly accumulated = signal(0);
  readonly withdrawals = signal<WithdrawalRequest[]>([]);
  readonly loading = signal(true);
  readonly requesting = signal(false);

  // Profissional particular pertence a uma revenda (resellerId preenchido).
  readonly isParticular = computed(() => !!this.appState.user()?.resellerId);

  constructor() {
    this.loadWallet();
    this.loadHistory();
  }

  statusLabel(status: WithdrawalRequest['status']): string {
    return WITHDRAWAL_STATUS_LABELS[status] ?? status;
  }

  private loadWallet(): void {
    this.wallet
      .getWallet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (w) => this.accumulated.set(w.availableCredits),
        error: () => {},
      });
  }

  private loadHistory(): void {
    this.loading.set(true);
    this.svc
      .list()
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

  request(): void {
    this.requesting.set(true);
    this.svc.request().subscribe({
      next: () => {
        this.requesting.set(false);
        this.notify.success('Saque solicitado.');
        this.loadWallet();
        this.loadHistory();
      },
      error: (err) => {
        this.requesting.set(false);
        // 409 = já existe solicitação PENDING/PROCESSING; 400 = saldo < 300.
        this.notify.error(err.message ?? 'Não foi possível solicitar o saque.');
      },
    });
  }
}
