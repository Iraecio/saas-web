import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type UiButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
export type UiButtonSize = 'sm' | 'md' | 'lg' | 'icon';

@Component({
  selector: 'ui-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="classes()"
      [attr.aria-busy]="loading()"
    >
      @if (loading()) {
        <span
          class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        ></span>
      }
      <ng-content />
    </button>
  `,
})
export class UiButtonComponent {
  readonly variant = input<UiButtonVariant>('primary');
  readonly size = input<UiButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  protected readonly classes = computed(
    () => `${this.base} ${this.sizes[this.size()]} ${this.variants[this.variant()]}`,
  );
  private readonly base =
    'inline-flex items-center justify-center gap-2 rounded-md font-semibold shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45';
  private readonly sizes: Record<UiButtonSize, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-sm',
    icon: 'size-10 p-0',
  };
  private readonly variants: Record<UiButtonVariant, string> = {
    primary: 'bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-md',
    secondary:
      'border border-border-strong bg-surface text-foreground hover:border-brand/40 hover:bg-surface-subtle',
    destructive: 'bg-danger text-white hover:brightness-90 hover:shadow-md',
    ghost: 'shadow-none text-foreground hover:bg-surface-subtle',
  };
}
