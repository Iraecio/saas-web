import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="p-6">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Visão geral dos indicadores principais.
        </p>
      </header>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Usuários</p>
              <p class="mt-2 text-3xl font-semibold text-neutral-900 dark:text-white">1.284</p>
              <p class="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <span>↑</span> 12.5% <span class="text-neutral-400">vs. período anterior</span>
              </p>
            </div>
            <div class="text-2xl">👥</div>
          </div>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Receita (mês)</p>
              <p class="mt-2 text-3xl font-semibold text-neutral-900 dark:text-white">R$ 48.320</p>
              <p class="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <span>↑</span> 3.1% <span class="text-neutral-400">vs. período anterior</span>
              </p>
            </div>
            <div class="text-2xl">💰</div>
          </div>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Conversão</p>
              <p class="mt-2 text-3xl font-semibold text-neutral-900 dark:text-white">2,4%</p>
              <p class="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <span>↓</span> 0.4% <span class="text-neutral-400">vs. período anterior</span>
              </p>
            </div>
            <div class="text-2xl">📈</div>
          </div>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Tickets abertos</p>
              <p class="mt-2 text-3xl font-semibold text-neutral-900 dark:text-white">18</p>
              <p class="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <span>↓</span> 22% <span class="text-neutral-400">vs. período anterior</span>
              </p>
            </div>
            <div class="text-2xl">🎫</div>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
          <div class="bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-200 px-6 py-4">
            <h3 class="text-lg font-semibold text-white dark:text-neutral-900">Vendas (últimos 30 dias)</h3>
          </div>
          <div class="flex h-64 items-center justify-center text-neutral-400 p-6">
            <div class="text-center">
              <p class="text-sm">📊 Área reservada para gráfico</p>
              <p class="text-xs mt-2 text-neutral-500">Integre com Chart.js ou similar</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
          <div class="bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-200 px-6 py-4">
            <h3 class="text-lg font-semibold text-white dark:text-neutral-900">Atividade recente</h3>
          </div>
          <div class="p-6">
            <ul class="space-y-3 text-sm">
              <li class="flex justify-between items-center pb-3 border-b border-neutral-100 dark:border-neutral-700">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Novo usuário cadastrado</span>
                </div>
                <span class="text-neutral-400 text-xs">há 2min</span>
              </li>
              <li class="flex justify-between items-center pb-3 border-b border-neutral-100 dark:border-neutral-700">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Fatura paga — #4520</span>
                </div>
                <span class="text-neutral-400 text-xs">há 12min</span>
              </li>
              <li class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>Backup concluído</span>
                </div>
                <span class="text-neutral-400 text-xs">há 1h</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class OverviewComponent {}
