import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '../../../../shared/components/card/card';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card';

@Component({
  selector: 'app-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, StatsCardComponent],
  template: `
    <div class="p-6">
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Visão geral dos indicadores principais.
        </p>
      </header>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <app-stats-card label="Usuários" [value]="1284" icon="👥" [delta]="12.5" />
        <app-stats-card label="Receita (mês)" value="R$ 48.320" icon="💰" [delta]="3.1" />
        <app-stats-card label="Conversão" value="2,4%" icon="📈" [delta]="-0.4" />
        <app-stats-card label="Tickets abertos" [value]="18" icon="🎫" [delta]="-22" />
      </section>

      <section class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <app-card title="Vendas (últimos 30 dias)">
            <div class="flex h-64 items-center justify-center text-neutral-400">
              Área reservada para gráfico
            </div>
          </app-card>
        </div>

        <app-card title="Atividade recente">
          <ul class="space-y-3 text-sm">
            <li class="flex justify-between border-b border-neutral-100 pb-2 dark:border-neutral-700">
              <span>Novo usuário cadastrado</span>
              <span class="text-neutral-400">há 2min</span>
            </li>
            <li class="flex justify-between border-b border-neutral-100 pb-2 dark:border-neutral-700">
              <span>Fatura paga — #4520</span>
              <span class="text-neutral-400">há 12min</span>
            </li>
            <li class="flex justify-between">
              <span>Backup concluído</span>
              <span class="text-neutral-400">há 1h</span>
            </li>
          </ul>
        </app-card>
      </section>
    </div>
  `,
})
export class OverviewComponent {}
