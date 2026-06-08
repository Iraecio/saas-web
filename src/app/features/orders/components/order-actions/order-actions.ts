import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ActionContext, OrderAction, availableOrderActions } from './order-actions.logic';
import { DisputeDecision } from '../../../../core/models/order.model';

export interface OrderActionEvent {
  action: OrderAction;
  text?: string; // reason / instructions / justification / notes
  decision?: DisputeDecision; // apenas para 'resolve'
}

const LABELS: Record<OrderAction, string> = {
  cancel: 'Cancelar pedido',
  'request-brief-revision': 'Solicitar revisão do briefing',
  accept: 'Aceitar',
  refuse: 'Recusar',
  'update-brief': 'Reenviar briefing',
  deliver: 'Entregar áudio',
  approve: 'Aprovar entrega',
  'request-revision': 'Solicitar revisão',
  dispute: 'Abrir disputa',
  resolve: 'Resolver disputa',
};

// Ações que exigem um texto obrigatório antes de confirmar.
const TEXT_REQUIRED: OrderAction[] = ['refuse', 'request-brief-revision', 'request-revision', 'dispute', 'resolve'];

@Component({
  selector: 'app-order-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap gap-2">
      @for (a of actions(); track a) {
        <button
          type="button"
          class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          [disabled]="disabled()"
          (click)="onClick(a)"
        >
          {{ labelFor(a) }}
        </button>
      }
    </div>

    @if (openAction(); as a) {
      <div class="mt-3 space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        <p class="text-sm font-medium">{{ labelFor(a) }}</p>

        @if (a === 'resolve') {
          <select class="form-input" [value]="decision()" (change)="decision.set($any($event.target).value)">
            <option value="FAVOR_CLIENT">A favor do cliente</option>
            <option value="FAVOR_PROFESSIONAL">A favor do profissional</option>
          </select>
        }

        <textarea
          class="form-input"
          rows="3"
          [placeholder]="placeholderFor(a)"
          [value]="text()"
          (input)="text.set($any($event.target).value)"
        ></textarea>

        <div class="flex gap-2">
          <button type="button" class="btn-primary" [disabled]="!canConfirm()" (click)="confirm()">Confirmar</button>
          <button type="button" class="btn-secondary" (click)="close()">Cancelar</button>
        </div>
      </div>
    }
  `,
})
export class OrderActionsComponent {
  readonly context = input.required<ActionContext>();
  readonly disabled = input(false);

  readonly run = output<OrderActionEvent>();
  readonly fileAction = output<'deliver' | 'update-brief'>();

  readonly openAction = signal<OrderAction | null>(null);
  readonly text = signal('');
  readonly decision = signal<DisputeDecision>('FAVOR_CLIENT');

  readonly actions = computed(() => availableOrderActions(this.context()));

  readonly canConfirm = computed(() => {
    const a = this.openAction();
    if (!a) return false;
    if (TEXT_REQUIRED.includes(a)) return this.text().trim().length > 0;
    return true;
  });

  labelFor(a: OrderAction): string {
    return LABELS[a] ?? a;
  }

  placeholderFor(a: OrderAction): string {
    const map: Partial<Record<OrderAction, string>> = {
      refuse: 'Motivo da recusa',
      'request-brief-revision': 'O que precisa ser corrigido no briefing',
      'request-revision': 'Instruções para a revisão',
      dispute: 'Justificativa da disputa',
      resolve: 'Notas da resolução',
    };
    return map[a] ?? 'Observações (opcional)';
  }

  onClick(a: OrderAction): void {
    if (a === 'deliver' || a === 'update-brief') {
      this.fileAction.emit(a);
      return;
    }
    if (TEXT_REQUIRED.includes(a)) {
      this.openAction.set(a);
      this.text.set('');
      this.decision.set('FAVOR_CLIENT');
      return;
    }
    // Ações sem input (accept, approve, cancel) → confirma direto.
    this.run.emit({ action: a });
  }

  confirm(): void {
    const a = this.openAction();
    if (!a || !this.canConfirm()) return;
    this.run.emit({
      action: a,
      text: this.text().trim() || undefined,
      decision: a === 'resolve' ? this.decision() : undefined,
    });
    this.close();
  }

  close(): void {
    this.openAction.set(null);
    this.text.set('');
  }
}
