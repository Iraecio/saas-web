import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {{ label() }}
          </p>
          <p class="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            {{ value() }}
          </p>
          @if (delta() !== undefined) {
            <p class="mt-2 flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
              <span>{{ deltaArrow() }}</span>
              <span>{{ deltaAbs() }}%</span>
              <span class="text-neutral-400 dark:text-neutral-500">vs. período anterior</span>
            </p>
          }
        </div>
        @if (icon()) {
          <div class="rounded-md border border-neutral-200 bg-white p-2 text-xl dark:border-neutral-800 dark:bg-neutral-900">
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
