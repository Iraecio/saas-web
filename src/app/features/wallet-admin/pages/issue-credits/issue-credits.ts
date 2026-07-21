import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WalletAdminService } from '../../services/wallet-admin';
import { CreditType, CreditOriginType } from '../../../../core/models/wallet.model';

@Component({
  selector: 'app-issue-credits',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Emitir / Cancelar Créditos</h1>
        <p class="mt-1 text-sm text-neutral-500">Exclusivo para SUPER_ADMIN</p>
      </header>

      <!-- Emitir créditos -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 class="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Emitir Créditos</h2>

        <form [formGroup]="issueForm" (ngSubmit)="issueCredits()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">User ID *</label>
              <input type="text" formControlName="userId" class="form-input w-full font-mono text-sm"
                placeholder="UUID do usuário" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Quantidade *</label>
              <input type="number" formControlName="amount" min="1" step="1" class="form-input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tipo *</label>
              <select formControlName="type" class="form-input w-full text-sm">
                <option value="PAID">Pago</option>
                <option value="PROMOTIONAL">Promocional</option>
                <option value="EARNED">Ganho</option>
                <option value="BONUS">Bônus</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Origem *</label>
              <select formControlName="originType" class="form-input w-full text-sm">
                <option value="PURCHASE">Compra</option>
                <option value="SERVICE_PAYMENT">Serviço</option>
                <option value="ADJUSTMENT">Ajuste</option>
                <option value="PROMOTION">Promoção</option>
                <option value="BONUS">Bônus</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Valor unitário (centavos) *</label>
              <input type="number" formControlName="valueCents" min="1" step="1" class="form-input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Custo unitário (centavos) *</label>
              <input type="number" formControlName="costCents" min="0" step="1" class="form-input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Validade (dias)</label>
              <input type="number" formControlName="expiresInDays" min="1" max="365" class="form-input w-full" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Observação</label>
              <textarea formControlName="note" rows="2" class="form-input w-full text-sm"
                placeholder="Motivo da emissão..."></textarea>
            </div>
          </div>

          @if (issueSuccess()) {
            <p class="text-sm text-green-600 dark:text-green-400">✓ Crédito emitido com sucesso.</p>
          }
          @if (issueError()) {
            <p class="text-sm text-red-500">{{ issueError() }}</p>
          }

          <div class="flex justify-end">
            <button type="submit" [disabled]="issueForm.invalid || issuingCredits()"
              class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
              {{ issuingCredits() ? 'Emitindo...' : 'Emitir Crédito' }}
            </button>
          </div>
        </form>
      </section>

      <!-- Cancelar crédito -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 class="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Cancelar Crédito</h2>

        <form [formGroup]="cancelForm" (ngSubmit)="cancelCredit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Credit ID *</label>
            <input type="text" formControlName="creditId" class="form-input w-full font-mono text-sm"
              placeholder="UUID do crédito a cancelar" />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Motivo</label>
            <input type="text" formControlName="reason" class="form-input w-full text-sm"
              placeholder="Motivo do cancelamento..." />
          </div>

          @if (cancelSuccess()) {
            <p class="text-sm text-green-600 dark:text-green-400">✓ Crédito cancelado.</p>
          }
          @if (cancelError()) {
            <p class="text-sm text-red-500">{{ cancelError() }}</p>
          }

          <div class="flex justify-end">
            <button type="submit" [disabled]="cancelForm.invalid || cancelingCredit()"
              class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
              {{ cancelingCredit() ? 'Cancelando...' : 'Cancelar Crédito' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  `,
})
export class IssueCreditsPage implements OnInit {
  private readonly walletAdminService = inject(WalletAdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly issuingCredits = signal(false);
  readonly issueSuccess = signal(false);
  readonly issueError = signal<string | undefined>(undefined);
  readonly cancelingCredit = signal(false);
  readonly cancelSuccess = signal(false);
  readonly cancelError = signal<string | undefined>(undefined);

  readonly issueForm = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    amount: [1, [Validators.required, Validators.min(1)]],
    valueCents: [1, [Validators.required, Validators.min(1)]],
    costCents: [0, [Validators.required, Validators.min(0)]],
    type: ['PAID' as CreditType, Validators.required],
    originType: ['PURCHASE' as CreditOriginType, Validators.required],
    expiresInDays: [0],
    note: [''],
  });

  readonly cancelForm = this.fb.nonNullable.group({
    creditId: ['', Validators.required],
    reason: ['', Validators.required],
  });

  ngOnInit(): void {
    const userId = this.route.snapshot.queryParamMap.get('userId');
    if (userId) {
      this.issueForm.patchValue({ userId });
    }
  }

  issueCredits(): void {
    if (this.issueForm.invalid) return;
    this.issuingCredits.set(true);
    this.issueSuccess.set(false);
    this.issueError.set(undefined);

    const { userId, amount, valueCents, costCents, type, originType, expiresInDays, note } = this.issueForm.getRawValue();
    this.walletAdminService
      .issueCredits({
        toUserId: userId,
        amount,
        valueCents,
        costCents,
        type,
        originType,
        expiresInDays: expiresInDays || undefined,
        metadata: note ? { description: note } : undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.issuingCredits.set(false);
          this.issueSuccess.set(true);
          this.issueForm.reset({ type: 'PAID', originType: 'PURCHASE', amount: 1, valueCents: 1, costCents: 0, expiresInDays: 0 });
          setTimeout(() => this.issueSuccess.set(false), 4000);
        },
        error: (err: Error) => {
          this.issuingCredits.set(false);
          this.issueError.set(err.message ?? 'Erro ao emitir crédito');
        },
      });
  }

  cancelCredit(): void {
    if (this.cancelForm.invalid) return;
    this.cancelingCredit.set(true);
    this.cancelSuccess.set(false);
    this.cancelError.set(undefined);

    const { creditId, reason } = this.cancelForm.getRawValue();
    this.walletAdminService
      .cancelCredits({ creditIds: [creditId], reason })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cancelingCredit.set(false);
          this.cancelSuccess.set(true);
          this.cancelForm.reset();
          setTimeout(() => this.cancelSuccess.set(false), 4000);
        },
        error: (err: Error) => {
          this.cancelingCredit.set(false);
          this.cancelError.set(err.message ?? 'Erro ao cancelar crédito');
        },
      });
  }
}
