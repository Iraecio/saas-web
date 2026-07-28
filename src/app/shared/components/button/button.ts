import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="classes()"
      (click)="clicked.emit($event)"
    >
      @if (loading()) {
        <span class="inline-block animate-spin">⟳</span>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<ButtonType>('button');
  readonly disabled = input(false);
  readonly loading = input(false);

  readonly clicked = output<MouseEvent>();

  readonly classes = computed(() => {
    const variant = this.variant();
    const size = this.size();
    const base =
      'inline-flex items-center justify-center gap-2 rounded-md font-semibold shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45';
    const sizes: Record<ButtonSize, string> = {
      sm: 'min-h-8 px-3 py-1 text-xs',
      md: 'min-h-10 px-4 py-2 text-sm',
      lg: 'min-h-11 px-5 py-2.5 text-sm',
    };
    const variants: Record<ButtonVariant, string> = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      danger: 'btn-danger',
      ghost: 'shadow-none text-foreground hover:bg-surface-subtle',
    };
    return `${base} ${sizes[size]} ${variants[variant]}`;
  });
}
