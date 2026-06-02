import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppStateService } from '../../../../core/services/app-state';
import { CardComponent } from '../../../../shared/components/card/card';

@Component({
  selector: 'app-settings-appearance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
  template: `
    <div class="p-6">
    <app-card title="Aparência">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium text-neutral-900 dark:text-white">Tema escuro</p>
          <p class="text-sm text-neutral-500">Alterar entre tema claro e escuro.</p>
        </div>
        <button type="button" class="btn-secondary" (click)="appState.toggleTheme()">
          {{ appState.theme() === 'dark' ? 'Desligar' : 'Ligar' }}
        </button>
      </div>
    </app-card>
    </div>
  `,
})
export class SettingsAppearanceComponent {
  protected readonly appState = inject(AppStateService);
}
