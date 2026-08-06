import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ServiceNegotiationSummary } from '../../../../core/models/service-negotiation.model';
import {
  formatMoney,
  NEGOTIATION_STATUS_LABEL,
  roleLabel,
} from '../../services/service-negotiation.presentation';

@Component({
  selector: 'app-negotiation-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <div class="grid gap-4 py-0.5">
      @for (item of items(); track item.id) {
        <button
          type="button"
          class="group grid min-h-28 w-full gap-4 rounded-xl bg-surface p-4 text-left ring-1 ring-border transition-shadow duration-200 hover:shadow-md hover:ring-border-strong focus-visible:ring-2 focus-visible:ring-brand md:grid-cols-[minmax(0,1.4fr)_minmax(12rem,1fr)_auto] md:items-center md:p-5"
          (click)="select.emit(item)"
        >
          <span class="flex min-w-0 items-center gap-3">
            <span
              class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 font-semibold text-brand"
            >
              {{ initials(item.professional.name) }}
            </span>
            <span class="min-w-0">
              <span class="block truncate font-semibold text-foreground">{{
                item.professional.name
              }}</span>
              <span class="mt-1 block truncate text-xs text-muted">
                {{ role(item.professional.role) }} · {{ item.service.name }}
              </span>
            </span>
          </span>
          <span class="grid grid-cols-2 gap-3">
            <span>
              <span class="block text-xs text-muted">Atual</span>
              <span class="font-mono text-sm font-semibold tabular-nums text-foreground">{{
                money(item.currentPriceCents)
              }}</span>
            </span>
            <span>
              <span class="block text-xs text-muted">Proposta</span>
              <span class="font-mono text-sm font-semibold tabular-nums text-foreground">{{
                money(item.proposedPriceCents)
              }}</span>
              <span
                class="ml-1 text-xs"
                [class]="item.variationPercent > 0 ? 'text-warning' : 'text-accent'"
              >
                {{ item.variationPercent > 0 ? '+' : '' }}{{ item.variationPercent.toFixed(1) }}%
              </span>
            </span>
          </span>
          <span class="flex items-center justify-between gap-3 md:flex-col md:items-end">
            <span class="rounded-md bg-surface-subtle px-2 py-1 text-xs font-semibold text-muted">
              {{ status[item.status] }}
            </span>
            <span class="text-xs text-muted">{{ item.createdAt | date: 'dd/MM/yyyy' }}</span>
          </span>
        </button>
      }
    </div>
  `,
})
export class NegotiationListComponent {
  readonly items = input.required<ServiceNegotiationSummary[]>();
  readonly select = output<ServiceNegotiationSummary>();
  readonly status = NEGOTIATION_STATUS_LABEL;
  readonly money = formatMoney;
  readonly role = roleLabel;

  initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
}
