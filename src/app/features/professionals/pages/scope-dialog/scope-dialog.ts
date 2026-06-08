import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { AppStateService } from '../../../../core/services/app-state';
import { Professional, SetScopeDto } from '../../../../core/models/professional.model';
import { ServiceScope } from '../../../../core/models/service.model';

@Component({
  selector: 'app-scope-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" (click)="close.emit()">
      <div class="w-full max-w-md space-y-4 rounded-xl bg-white p-6 dark:bg-neutral-900" (click)="$event.stopPropagation()">
        <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">
          Definir escopo — {{ professional().name }}
        </h2>

        @if (isAdmin()) {
          <p class="text-sm text-neutral-500">
            Como administrador, você classifica este profissional como <strong>Global</strong> (da plataforma).
          </p>
        } @else {
          <p class="text-sm text-neutral-500">
            Como revenda, você vincula este profissional como <strong>Particular</strong> da sua rede.
          </p>
        }

        <div class="flex gap-2">
          <button type="button" class="btn-primary" [disabled]="saving()" (click)="confirm()">
            {{ saving() ? 'Salvando...' : (isAdmin() ? 'Tornar Global' : 'Vincular à minha revenda') }}
          </button>
          <button type="button" class="btn-secondary" (click)="close.emit()">Cancelar</button>
        </div>
      </div>
    </div>
  `,
})
export class ScopeDialogComponent {
  private readonly appState = inject(AppStateService);

  readonly professional = input.required<Professional>();
  readonly saving = input(false);

  readonly confirmScope = output<SetScopeDto>();
  readonly close = output<void>();

  readonly isAdmin = computed(() => this.appState.isAdmin());

  confirm(): void {
    if (this.isAdmin()) {
      const dto: SetScopeDto = { scope: 'GLOBAL' as ServiceScope };
      this.confirmScope.emit(dto);
    } else {
      const resellerId = this.appState.user()?.resellerId ?? undefined;
      this.confirmScope.emit({ scope: 'PARTICULAR' as ServiceScope, resellerId });
    }
  }
}
