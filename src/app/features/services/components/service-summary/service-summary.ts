import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Service } from '../../../../core/models/service.model';

@Component({
  selector: 'app-service-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid grid-cols-2 gap-4 lg:grid-cols-5" aria-label="Resumo dos serviços">
      @for (item of metrics(); track item.label) {
        <article class="rounded-xl bg-surface p-4 ring-1 ring-border">
          <p class="text-xs font-medium text-muted">{{ item.label }}</p>
          <p class="mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground">
            {{ item.value }}
          </p>
        </article>
      }
    </section>
  `,
})
export class ServiceSummaryComponent {
  readonly services = input.required<Service[]>();
  readonly metrics = computed(() => {
    const services = this.services();
    return [
      { label: 'Total', value: services.length },
      { label: 'Ativos', value: services.filter((item) => item.isActive).length },
      { label: 'Inativos', value: services.filter((item) => !item.isActive).length },
      {
        label: 'Locução',
        value: services.filter((item) => item.professionalRole === 'VOICE_ACTOR').length,
      },
      {
        label: 'Produção',
        value: services.filter((item) => item.professionalRole === 'PRODUCER').length,
      },
    ];
  });
}
