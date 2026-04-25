import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppStateService } from '../../../../core/services/app-state';

@Component({
  selector: 'app-producer-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="p-6 space-y-6">

      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">
            Olá, {{ appState.userName() }} 🎧
          </h1>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Painel do Produtor</p>
        </div>
        <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
          🎧 Produtor
        </span>
      </header>

      <!-- Stats -->
      <section class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        @for (stat of stats; track stat.label) {
          <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{{ stat.label }}</p>
                <p class="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{{ stat.value }}</p>
                <p class="mt-1 text-xs text-neutral-400">{{ stat.sub }}</p>
              </div>
              <span class="text-2xl">{{ stat.icon }}</span>
            </div>
          </div>
        }
      </section>

      <!-- Projetos na fila + Histórico -->
      <section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="lg:col-span-2 rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700 overflow-hidden">
          <div class="border-b border-neutral-200 px-5 py-4 dark:border-neutral-700 flex justify-between items-center">
            <h3 class="font-semibold text-neutral-900 dark:text-white">Aguardando Produção</h3>
            <span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-600">{{ queue.length }} projetos</span>
          </div>
          <ul class="divide-y divide-neutral-100 dark:divide-neutral-700">
            @for (project of queue; track project.id) {
              <li class="flex items-center justify-between px-5 py-4 text-sm">
                <div class="flex items-center gap-3">
                  <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-lg">🎵</span>
                  <div>
                    <p class="font-medium text-neutral-800 dark:text-neutral-200">{{ project.client }}</p>
                    <p class="text-xs text-neutral-400">{{ project.type }} · Locutor: {{ project.actor }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-right">
                    <p class="text-xs text-neutral-500">{{ project.deadline }}</p>
                    <p class="text-xs font-semibold text-orange-500">{{ project.value }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button class="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200 transition">
                      ⬇️ Baixar
                    </button>
                    <button class="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition">
                      Aceitar
                    </button>
                  </div>
                </div>
              </li>
            }
          </ul>
        </div>

        <div class="space-y-4">
          <!-- Em produção -->
          <div class="rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700 overflow-hidden">
            <div class="border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
              <h3 class="font-semibold text-neutral-900 dark:text-white">Em Produção</h3>
            </div>
            <ul class="divide-y divide-neutral-100 dark:divide-neutral-700">
              @for (project of inProduction; track project.id) {
                <li class="px-5 py-3 text-sm">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-medium text-neutral-800 dark:text-neutral-200">{{ project.client }}</p>
                      <p class="text-xs text-neutral-400">{{ project.type }}</p>
                    </div>
                    <button class="rounded-lg bg-violet-500 px-3 py-1 text-xs font-semibold text-white hover:bg-violet-600 transition">
                      Entregar
                    </button>
                  </div>
                </li>
              }
            </ul>
          </div>

          <!-- Ganhos do mês -->
          <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
            <h3 class="mb-3 font-semibold text-neutral-900 dark:text-white">Ganhos do Mês</h3>
            <p class="text-3xl font-bold text-emerald-600">R$ 1.680</p>
            <p class="mt-1 text-xs text-neutral-400">32 projetos concluídos</p>
            <div class="mt-3 h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-700">
              <div class="h-1.5 w-3/4 rounded-full bg-emerald-400"></div>
            </div>
            <p class="mt-1 text-xs text-neutral-400">75% da meta mensal</p>
          </div>
        </div>
      </section>

    </div>
  `,
})
export class ProducerDashboardComponent {
  protected readonly appState = inject(AppStateService);

  protected readonly stats = [
    { label: 'Projetos na Fila', value: '5', sub: 'aguardando produção', icon: '📥' },
    { label: 'Concluídos (mês)', value: '32', sub: 'este mês', icon: '✅' },
    { label: 'Ganhos (mês)', value: 'R$ 1.680', sub: 'a receber', icon: '💰' },
  ];

  protected readonly queue = [
    { id: 1, client: 'Rádio Hits FM', type: 'Spot', actor: 'Carlos V.', deadline: '🔥 urgente', value: 'R$ 120' },
    { id: 2, client: 'Agência Digital', type: 'Spot', actor: 'Ana R.', deadline: '2h', value: 'R$ 180' },
    { id: 3, client: 'Studio Sound', type: 'Edição', actor: '-', deadline: '4h', value: 'R$ 90' },
    { id: 4, client: 'DigitalMark', type: 'Spot', actor: 'João M.', deadline: 'amanhã', value: 'R$ 200' },
    { id: 5, client: 'Marcos Lima', type: 'Edição', actor: '-', deadline: 'amanhã', value: 'R$ 80' },
  ];

  protected readonly inProduction = [
    { id: 1, client: 'Rádio Top FM', type: 'Spot com trilha' },
    { id: 2, client: 'BrandVoice', type: 'Edição final' },
  ];
}
