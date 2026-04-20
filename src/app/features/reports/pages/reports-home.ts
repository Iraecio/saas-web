import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '../../../shared/components/card/card';

@Component({
  selector: 'app-reports-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
  template: `
    <div class="p-6">
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Relatórios</h1>
        <p class="mt-1 text-sm text-neutral-500">Exportações e análises.</p>
      </header>

      <app-card title="Relatórios disponíveis">
        <ul class="divide-y divide-neutral-200 text-neutral-900 dark:divide-neutral-800 dark:text-neutral-100">
          <li class="flex items-center justify-between py-3">
            <span>Vendas por período</span>
            <button class="btn-secondary">Gerar</button>
          </li>
          <li class="flex items-center justify-between py-3">
            <span>Usuários ativos</span>
            <button class="btn-secondary">Gerar</button>
          </li>
          <li class="flex items-center justify-between py-3">
            <span>Auditoria de acesso</span>
            <button class="btn-secondary">Gerar</button>
          </li>
        </ul>
      </app-card>
    </div>
  `,
})
export class ReportsHomeComponent {}
