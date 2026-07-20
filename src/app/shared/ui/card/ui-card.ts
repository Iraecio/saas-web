import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block rounded-lg border border-border bg-surface shadow-sm' },
  template: `
    @if (title() || description()) {
      <header class="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h3 class="text-sm font-semibold text-foreground">{{ title() }}</h3>
          @if (description()) {
            <p class="mt-1 text-sm text-muted">{{ description() }}</p>
          }
        </div>
        <ng-content select="[uiCardActions]" />
      </header>
    }
    <div [class]="padding() ? 'p-5' : ''"><ng-content /></div>
  `,
})
export class UiCardComponent {
  readonly title = input<string>();
  readonly description = input<string>();
  readonly padding = input(true);
}
