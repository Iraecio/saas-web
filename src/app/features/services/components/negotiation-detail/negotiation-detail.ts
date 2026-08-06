import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  afterNextRender,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ServiceNegotiationDetail } from '../../../../core/models/service-negotiation.model';
import {
  canManagerDecide,
  formatMoney,
  NEGOTIATION_STATUS_LABEL,
} from '../../services/service-negotiation.presentation';

export interface CounterDecision {
  proposedPriceCents: number;
  notes?: string;
}

@Component({
  selector: 'app-negotiation-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  host: { class: 'fixed inset-0 z-50' },
  template: `
    <div
      class="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
      (click)="close.emit()"
      aria-hidden="true"
    ></div>
    <aside
      #drawer
      role="dialog"
      aria-modal="true"
      aria-labelledby="negotiation-title"
      tabindex="-1"
      class="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-surface shadow-2xl"
    >
      <header
        class="flex items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-7"
      >
        <div>
          <p class="text-xs font-semibold text-brand">Renegociação de valor</p>
          <h2
            id="negotiation-title"
            class="mt-1 text-xl font-semibold tracking-tight text-foreground"
          >
            {{ detail().professional.name }}
          </h2>
          <p class="mt-1 text-sm text-muted">{{ detail().service.name }}</p>
        </div>
        <button type="button" class="btn-icon" aria-label="Fechar detalhes" (click)="close.emit()">
          ×
        </button>
      </header>

      <div class="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        <section class="grid grid-cols-2 gap-3 rounded-xl bg-surface-subtle p-4">
          <div>
            <p class="text-xs text-muted">Valor vigente</p>
            <p class="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
              {{ money(detail().currentPriceCents) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-muted">Valor proposto</p>
            <p class="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
              {{ money(detail().proposedPriceCents) }}
            </p>
          </div>
        </section>

        @if (detail().notes) {
          <section class="mt-5 rounded-xl bg-brand/6 p-4 ring-1 ring-brand/15">
            <p class="text-xs font-semibold text-brand">Justificativa</p>
            <p class="mt-2 text-sm leading-6 text-foreground">{{ detail().notes }}</p>
          </section>
        }

        <section class="mt-7">
          <h3 class="text-sm font-semibold text-foreground">Histórico da conversa</h3>
          <ol class="mt-4 space-y-0">
            @for (step of detail().timeline; track step.id; let last = $last) {
              <li class="relative grid grid-cols-[1.25rem_1fr] gap-3 pb-5">
                @if (!last) {
                  <span class="absolute bottom-0 left-[0.35rem] top-3 w-px bg-border"></span>
                }
                <span
                  class="relative mt-1.5 size-3 rounded-full bg-brand ring-4 ring-surface"
                ></span>
                <div>
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <p class="text-sm font-semibold text-foreground">
                      {{
                        step.initiator === 'PROFESSIONAL'
                          ? 'Proposta do profissional'
                          : 'Proposta da gestão'
                      }}
                    </p>
                    <span class="text-xs text-muted">{{
                      step.createdAt | date: 'dd/MM/yyyy HH:mm'
                    }}</span>
                  </div>
                  <p class="mt-1 font-mono text-sm tabular-nums text-foreground">
                    {{ money(step.previousPriceCents) }} → {{ money(step.proposedPriceCents) }}
                  </p>
                  <p class="mt-1 text-xs text-muted">{{ status[step.status] }}</p>
                  @if (step.notes) {
                    <p class="mt-2 text-sm leading-5 text-muted">{{ step.notes }}</p>
                  }
                </div>
              </li>
            }
          </ol>
        </section>

        @if (!canDecide()) {
          <div class="mt-5 rounded-xl bg-surface-subtle p-4 text-sm text-muted">
            @if (detail().nextActor === 'PROFESSIONAL') {
              A contraproposta está aguardando a resposta do profissional.
            } @else {
              Esta negociação foi finalizada e permanece disponível para consulta.
            }
          </div>
        }

        @if (mode() === 'reject') {
          <label class="mt-6 block text-sm font-medium text-foreground">
            Motivo da negativa
            <textarea
              class="form-input mt-2 min-h-24"
              [value]="notes()"
              (input)="notes.set($any($event.target).value)"
              placeholder="Explique a decisão ao profissional"
            ></textarea>
          </label>
        }
        @if (mode() === 'counter') {
          <div class="mt-6 space-y-4">
            <label class="block text-sm font-medium text-foreground">
              Sua contraproposta (R$)
              <input
                class="form-input mt-2"
                type="number"
                min="0.01"
                step="0.01"
                [value]="counterValue()"
                (input)="counterValue.set($any($event.target).value)"
              />
            </label>
            <label class="block text-sm font-medium text-foreground">
              Observação opcional
              <textarea
                class="form-input mt-2 min-h-20"
                [value]="notes()"
                (input)="notes.set($any($event.target).value)"
              ></textarea>
            </label>
          </div>
        }
      </div>

      @if (canDecide()) {
        <footer class="border-t border-border bg-surface px-5 py-4 sm:px-7">
          @if (mode() === 'default') {
            <div class="grid grid-cols-3 gap-2">
              <button type="button" class="btn-primary" [disabled]="busy()" (click)="accept.emit()">
                Aprovar
              </button>
              <button
                type="button"
                class="btn-secondary"
                [disabled]="busy()"
                (click)="startMode('counter')"
              >
                Contrapor
              </button>
              <button
                type="button"
                class="btn-secondary text-danger"
                [disabled]="busy()"
                (click)="startMode('reject')"
              >
                Negar
              </button>
            </div>
          } @else {
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="btn-secondary"
                [disabled]="busy()"
                (click)="startMode('default')"
              >
                Cancelar
              </button>
              @if (mode() === 'reject') {
                <button
                  type="button"
                  class="btn-danger"
                  [disabled]="busy() || notes().trim().length < 3"
                  (click)="reject.emit(notes().trim())"
                >
                  Confirmar negativa
                </button>
              } @else {
                <button
                  type="button"
                  class="btn-primary"
                  [disabled]="busy() || counterCents() < 1"
                  (click)="submitCounter()"
                >
                  Enviar contraproposta
                </button>
              }
            </div>
          }
        </footer>
      }
    </aside>
  `,
})
export class NegotiationDetailComponent {
  private readonly drawer = viewChild<ElementRef<HTMLElement>>('drawer');
  readonly detail = input.required<ServiceNegotiationDetail>();
  readonly busy = input(false);
  readonly close = output<void>();
  readonly accept = output<void>();
  readonly reject = output<string>();
  readonly counter = output<CounterDecision>();
  readonly mode = signal<'default' | 'reject' | 'counter'>('default');
  readonly notes = signal('');
  readonly counterValue = signal('');
  readonly counterCents = computed(() => Math.round(Number(this.counterValue()) * 100) || 0);
  readonly canDecide = computed(() => canManagerDecide(this.detail()));
  readonly money = formatMoney;
  readonly status = NEGOTIATION_STATUS_LABEL;

  constructor() {
    afterNextRender(() => this.drawer()?.nativeElement.focus());
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.close.emit();
  }

  startMode(mode: 'default' | 'reject' | 'counter'): void {
    this.mode.set(mode);
    this.notes.set('');
    if (mode === 'counter')
      this.counterValue.set((this.detail().proposedPriceCents / 100).toFixed(2));
  }

  submitCounter(): void {
    this.counter.emit({
      proposedPriceCents: this.counterCents(),
      notes: this.notes().trim() || undefined,
    });
  }
}
