import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      @if (title()) {
        <header class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">{{ title() }}</h3>
          <ng-content select="[slot=actions]" />
        </header>
      }
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  readonly title = input<string>();
}
