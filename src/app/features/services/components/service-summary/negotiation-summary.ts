import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NegotiationCounters } from '../../../../core/models/service-negotiation.model';

@Component({
  selector: 'app-negotiation-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-4 sm:grid-cols-3" aria-label="Resumo das renegociações">
      <article class="rounded-xl bg-warning/8 p-4 ring-1 ring-warning/20">
        <p class="text-xs font-medium text-muted">Aguardando você</p>
        <p class="mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground">
          {{ counters().pendingManager }}
        </p>
      </article>
      <article class="rounded-xl bg-brand/6 p-4 ring-1 ring-brand/15">
        <p class="text-xs font-medium text-muted">Aguardando profissional</p>
        <p class="mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground">
          {{ counters().pendingProfessional }}
        </p>
      </article>
      <article class="rounded-xl bg-surface p-4 ring-1 ring-border">
        <p class="text-xs font-medium text-muted">Finalizadas</p>
        <p class="mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground">
          {{ counters().finished }}
        </p>
      </article>
    </section>
  `,
})
export class NegotiationSummaryComponent {
  readonly counters = input.required<NegotiationCounters>();
}
