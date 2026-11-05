import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      @if (title()) {
        <header
          class="-mx-5 -mt-5 mb-5 flex items-center justify-between border-b border-border px-5 py-3.5"
        >
          <h3 class="text-[15px] font-medium text-foreground">{{ title() }}</h3>
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
