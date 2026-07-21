import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { WalletService } from '../../services/wallet';
import { CreditWithContext, CreditEvent, Dispute } from '../../../../core/models/wallet.model';

@Component({
  selector: 'app-credit-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <header class="flex items-center gap-4">
        <a routerLink="../" class="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">← Voltar</a>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Detalhe do Crédito</h1>
      </header>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (credit()) {
        <!-- Info do crédito -->
        <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-neutral-500">Valor</p>
            <p class="text-2xl font-bold text-neutral-900 dark:text-white">{{ credit()!.valueCents / 100 | number:'1.2-2' }}</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500">Status</p>
            <span class="text-sm font-medium px-2 py-0.5 rounded-full" [class]="statusBadge(credit()!.status)">
              {{ credit()!.status }}
            </span>
          </div>
          <div>
            <p class="text-xs text-neutral-500">Tipo</p>
            <p class="text-sm font-medium text-neutral-900 dark:text-white">{{ credit()!.type }}</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500">Origem</p>
            <p class="text-sm font-medium text-neutral-900 dark:text-white">{{ credit()!.originType }}</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500">Criado em</p>
            <p class="text-sm text-neutral-700 dark:text-neutral-300">{{ credit()!.issuedAt | date:'dd/MM/yyyy HH:mm' }}</p>
          </div>
          @if (credit()!.expiresAt) {
            <div>
              <p class="text-xs text-neutral-500">Expira em</p>
              <p class="text-sm text-neutral-700 dark:text-neutral-300">{{ credit()!.expiresAt | date:'dd/MM/yyyy' }}</p>
            </div>
          }
        </section>

        <!-- Linha do tempo de eventos -->
        <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 class="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Histórico de Eventos</h2>
          @if (credit()!.events.length === 0) {
            <p class="text-sm text-neutral-500 text-center py-4">Nenhum evento registrado.</p>
          } @else {
            <div class="relative pl-4 border-l-2 border-neutral-200 dark:border-neutral-700 space-y-4">
              @for (event of credit()!.events; track event.id) {
                <div class="relative">
                  <div class="absolute -left-[1.4rem] w-3 h-3 rounded-full bg-neutral-300 dark:bg-neutral-600 top-0.5"></div>
                  <p class="text-sm font-medium text-neutral-900 dark:text-white">{{ event.eventType }}</p>
                  @if (event.note) {
                    <p class="text-xs text-neutral-500 mt-0.5">{{ event.note }}</p>
                  }
                  @if (event.amount != null) {
                    <p class="text-xs text-neutral-500">Valor: {{ event.amount | number:'1.2-2' }}</p>
                  }
                  <p class="text-xs text-neutral-400 mt-0.5">{{ event.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
              }
            </div>
          }
        </section>

        <!-- Disputas -->
        <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">Disputas</h2>
            <button (click)="showDisputeForm.set(!showDisputeForm())"
              class="text-sm px-3 py-1.5 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              + Reportar disputa
            </button>
          </div>

          @if (showDisputeForm()) {
            <form [formGroup]="disputeForm" (ngSubmit)="submitDispute()" class="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Motivo</label>
                <textarea formControlName="reason" rows="3" class="form-input w-full text-sm"
                  placeholder="Descreva o motivo da disputa..."></textarea>
              </div>
              @if (disputeError()) {
                <p class="text-sm text-red-500">{{ disputeError() }}</p>
              }
              <div class="flex justify-end gap-2">
                <button type="button" (click)="showDisputeForm.set(false)"
                  class="px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                  Cancelar
                </button>
                <button type="submit" [disabled]="disputeForm.invalid || submittingDispute()"
                  class="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg disabled:opacity-50 hover:bg-red-700 transition-colors">
                  {{ submittingDispute() ? 'Enviando...' : 'Reportar' }}
                </button>
              </div>
            </form>
          }

          @if (credit()!.disputes.length === 0 && !showDisputeForm()) {
            <p class="text-sm text-neutral-500 text-center py-2">Nenhuma disputa registrada.</p>
          } @else {
            @for (dispute of credit()!.disputes; track dispute.id) {
              <div class="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-sm space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-neutral-900 dark:text-white">{{ dispute.reason }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {{ dispute.status }}
                  </span>
                </div>
                @if (dispute.investigationNotes) {
                  <p class="text-xs text-neutral-500">Notas: {{ dispute.investigationNotes }}</p>
                }
                <p class="text-xs text-neutral-400">{{ dispute.createdAt | date:'dd/MM/yyyy' }}</p>
              </div>
            }
          }
        </section>

        <!-- Solicitar reembolso -->
        <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">Reembolso</h2>
            <button (click)="showRefundForm.set(!showRefundForm())"
              class="text-sm px-3 py-1.5 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
              Solicitar reembolso
            </button>
          </div>

          @if (showRefundForm()) {
            <form [formGroup]="refundForm" (ngSubmit)="submitRefund()" class="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Justificativa *</label>
                <textarea formControlName="reason" rows="3" class="form-input w-full text-sm"
                  placeholder="Justifique sua solicitação de reembolso..."></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Observações (opcional)</label>
                <input type="text" formControlName="note" class="form-input w-full text-sm" />
              </div>
              @if (refundSuccess()) {
                <p class="text-sm text-green-600 dark:text-green-400">✓ Reembolso solicitado com sucesso.</p>
              }
              @if (refundError()) {
                <p class="text-sm text-red-500">{{ refundError() }}</p>
              }
              <div class="flex justify-end gap-2">
                <button type="button" (click)="showRefundForm.set(false)"
                  class="px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400">Cancelar</button>
                <button type="submit" [disabled]="refundForm.invalid || submittingRefund()"
                  class="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg disabled:opacity-50 hover:bg-amber-700 transition-colors">
                  {{ submittingRefund() ? 'Enviando...' : 'Solicitar' }}
                </button>
              </div>
            </form>
          }
        </section>
      }
    </div>
  `,
})
export class CreditDetailPage implements OnInit {
  private readonly walletService = inject(WalletService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly credit = signal<CreditWithContext | null>(null);
  readonly loading = signal(true);
  readonly showDisputeForm = signal(false);
  readonly showRefundForm = signal(false);
  readonly submittingDispute = signal(false);
  readonly submittingRefund = signal(false);
  readonly disputeError = signal<string | undefined>(undefined);
  readonly refundError = signal<string | undefined>(undefined);
  readonly refundSuccess = signal(false);

  readonly disputeForm = this.fb.nonNullable.group({
    reason: ['', Validators.required],
  });

  readonly refundForm = this.fb.nonNullable.group({
    reason: ['', Validators.required],
    note: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.walletService
      .getCreditWithContext(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (c) => { this.credit.set(c); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  submitDispute(): void {
    const credit = this.credit();
    if (!credit || this.disputeForm.invalid) return;
    this.submittingDispute.set(true);
    this.disputeError.set(undefined);

    this.walletService
      .reportDispute(credit.id, { reason: this.disputeForm.getRawValue().reason })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submittingDispute.set(false);
          this.showDisputeForm.set(false);
          this.disputeForm.reset();
        },
        error: (err: Error) => {
          this.submittingDispute.set(false);
          this.disputeError.set(err.message ?? 'Erro ao reportar disputa');
        },
      });
  }

  submitRefund(): void {
    const credit = this.credit();
    if (!credit || this.refundForm.invalid) return;
    this.submittingRefund.set(true);
    this.refundError.set(undefined);
    this.refundSuccess.set(false);

    const { reason, note } = this.refundForm.getRawValue();
    this.walletService
      .requestRefund(credit.id, { reason, note: note || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submittingRefund.set(false);
          this.refundSuccess.set(true);
          this.refundForm.reset();
        },
        error: (err: Error) => {
          this.submittingRefund.set(false);
          this.refundError.set(err.message ?? 'Erro ao solicitar reembolso');
        },
      });
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
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
