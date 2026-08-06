import { ChangeDetectionStrategy, Component, OnDestroy, signal, inject } from '@angular/core';
import { ImpersonationService } from '../../../core/services/impersonation';

@Component({
  selector: 'app-impersonation-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (inspection.active() && inspection.session(); as session) {
      <aside
        class="flex flex-col gap-3 bg-amber-300 px-4 py-3 text-neutral-950 sm:flex-row sm:items-center sm:justify-between"
        role="status"
        aria-live="polite"
      >
        <div>
          <p class="text-sm font-semibold">Inspeção somente leitura · {{ session.target.name }}</p>
          <p class="text-xs text-neutral-700">
            Perspectiva de
            {{ session.target.role === 'VOICE_ACTOR' ? 'locutor(a)' : 'produtor(a)' }} · termina em
            {{ countdown() }}
          </p>
        </div>
        <button
          type="button"
          class="min-h-11 shrink-0 rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 active:translate-y-px"
          (click)="inspection.stop()"
        >
          Voltar ao superadmin
        </button>
      </aside>
    }
  `,
})
export class ImpersonationBannerComponent implements OnDestroy {
  protected readonly inspection = inject(ImpersonationService);
  readonly countdown = signal(this.format());
  private readonly timer = setInterval(() => this.countdown.set(this.format()), 1000);
  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
  private format(): string {
    const seconds = this.inspection.remainingSeconds();
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
}
