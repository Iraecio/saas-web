import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: '<ng-content />',
})
export class UiBadgeComponent {
  readonly tone = input<'neutral' | 'brand' | 'success' | 'warning' | 'danger'>('neutral');
  protected readonly classes = computed(
    () =>
      `inline-flex items-center rounded-sm px-2 py-1 text-xs font-semibold ${this.tones[this.tone()]}`,
  );
  private readonly tones = {
    neutral: 'bg-surface-subtle text-muted',
    brand: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
    warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    danger: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200',
  };
}
