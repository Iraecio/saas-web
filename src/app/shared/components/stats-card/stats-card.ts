import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-[13px] font-medium tracking-wide text-muted">
            {{ label() }}
          </p>
          <p class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {{ value() }}
          </p>
          @if (delta() !== undefined) {
            <p class="mt-2 flex items-center gap-1 text-xs text-muted">
              <span>{{ deltaArrow() }}</span>
              <span>{{ deltaAbs() }}%</span>
              <span class="text-muted/75">vs. período anterior</span>
            </p>
          }
        </div>
        @if (icon()) {
          <div class="grid size-12 place-items-center rounded-lg bg-brand/10 text-xl text-brand">
            {{ icon() }}
          </div>
        }
      </div>
    </div>
  `,
})
export class StatsCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input<string>();
  readonly delta = input<number | undefined>();

  readonly deltaArrow = computed(() => ((this.delta() ?? 0) >= 0 ? '↑' : '↓'));
  readonly deltaAbs = computed(() => Math.abs(this.delta() ?? 0));
}
