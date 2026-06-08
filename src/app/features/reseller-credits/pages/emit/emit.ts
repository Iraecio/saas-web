import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../../../core/services/api';
import { NotificationService } from '../../../../core/services/notification';
import { ResellerCreditService } from '../../services/reseller-credit';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-emit-credit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  template: `
    <div class="p-6 max-w-xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Emitir créditos</h1>
        <p class="mt-1 text-sm text-neutral-500">Adicione créditos RESELLER à carteira de um cliente da sua rede</p>
      </header>

      <div class="space-y-4">
        <div>
          <label class="form-label">Cliente</label>
          @if (loadingClients()) {
            <p class="text-sm text-neutral-500">Carregando clientes...</p>
          } @else {
            <select class="form-input" [value]="clientId()" (change)="clientId.set($any($event.target).value)">
              <option value="">Selecione...</option>
              @for (c of clients(); track c.id) {
                <option [value]="c.id">{{ c.name || c.email }}</option>
              }
            </select>
          }
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Quantidade de créditos</label>
            <input type="number" min="1" class="form-input" [value]="creditAmount()" (input)="creditAmount.set(+$any($event.target).value)" />
          </div>
          <div>
            <label class="form-label">Valor unitário (centavos)</label>
            <input type="number" min="1" class="form-input" [value]="unitValueCents()" (input)="unitValueCents.set(+$any($event.target).value)" />
          </div>
        </div>

        @if (totalCents() > 0) {
          <p class="text-sm text-neutral-500">
            Total cobrado: <strong>R$ {{ (totalCents() / 100) | number: '1.2-2' }}</strong>
          </p>
        }

        <button type="button" class="btn-primary" [disabled]="!canSubmit() || emitting()" (click)="submit()">
          {{ emitting() ? 'Emitindo...' : 'Emitir créditos' }}
        </button>
      </div>
    </div>
  `,
})
export class EmitCreditPage {
  private readonly api = inject(ApiService);
  private readonly svc = inject(ResellerCreditService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly clients = signal<User[]>([]);
  readonly loadingClients = signal(true);
  readonly clientId = signal('');
  readonly creditAmount = signal(0);
  readonly unitValueCents = signal(0);
  readonly emitting = signal(false);

  readonly totalCents = computed(() => this.creditAmount() * this.unitValueCents());
  readonly canSubmit = computed(
    () => !!this.clientId() && this.creditAmount() > 0 && this.unitValueCents() > 0,
  );

  constructor() {
    // A API filtra clientes da rede da revenda autenticada.
    this.api
      .listUsers({ role: 'CLIENT', limit: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.clients.set(list);
          this.loadingClients.set(false);
        },
        error: (err) => {
          this.notify.error(err.message ?? 'Erro ao carregar clientes');
          this.loadingClients.set(false);
        },
      });
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.emitting.set(true);
    this.svc
      .emit({
        clientId: this.clientId(),
        creditAmount: this.creditAmount(),
        unitValueCents: this.unitValueCents(),
      })
      .subscribe({
        next: (res) => {
          this.emitting.set(false);
          this.notify.success(
            `Créditos emitidos. Novo saldo: ${res.newWalletBalance ?? '—'}.`,
          );
          this.clientId.set('');
          this.creditAmount.set(0);
          this.unitValueCents.set(0);
        },
        error: (err) => {
          this.emitting.set(false);
          // 403 = cliente fora da rede da revenda.
          this.notify.error(err.message ?? 'Não foi possível emitir créditos.');
        },
      });
  }
}
