import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppStateService } from '../../../../core/services/app-state';
import { NotificationService } from '../../../../core/services/notification';
import { ProfessionalService } from '../../services/professional';
import { ScopeDialogComponent } from '../scope-dialog/scope-dialog';
import {
  Professional,
  SetScopeDto,
} from '../../../../core/models/professional.model';
import { ServiceScope } from '../../../../core/models/service.model';

type Tab = 'voice-actors' | 'producers';

@Component({
  selector: 'app-professionals-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScopeDialogComponent],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Profissionais</h1>
        <p class="mt-1 text-sm text-neutral-500">Locutores e produtores disponíveis</p>
      </header>

      <div class="flex flex-wrap gap-3">
        <div class="flex rounded-lg border border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            class="px-4 py-2 text-sm"
            [class.bg-neutral-900]="tab() === 'voice-actors'"
            [class.text-white]="tab() === 'voice-actors'"
            [class.dark:bg-white]="tab() === 'voice-actors'"
            [class.dark:text-neutral-900]="tab() === 'voice-actors'"
            (click)="setTab('voice-actors')"
          >
            Locutores
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm"
            [class.bg-neutral-900]="tab() === 'producers'"
            [class.text-white]="tab() === 'producers'"
            [class.dark:bg-white]="tab() === 'producers'"
            [class.dark:text-neutral-900]="tab() === 'producers'"
            (click)="setTab('producers')"
          >
            Produtores
          </button>
        </div>

        <select class="form-input sm:w-48" [value]="scopeFilter()" (change)="onScope($any($event.target).value)">
          <option value="">Todos os escopos</option>
          <option value="GLOBAL">Global</option>
          <option value="PARTICULAR">Particular</option>
        </select>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (professionals().length === 0) {
        <p class="py-12 text-center text-sm text-neutral-500">Nenhum profissional encontrado.</p>
      } @else {
        <div class="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 dark:bg-neutral-900 text-left text-neutral-500">
              <tr>
                <th class="px-4 py-3 font-medium">Nome</th>
                <th class="px-4 py-3 font-medium">Escopo</th>
                <th class="px-4 py-3 font-medium">Verificação</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              @for (p of professionals(); track p.id) {
                <tr class="bg-white dark:bg-neutral-950">
                  <td class="px-4 py-3 font-medium text-neutral-900 dark:text-white">{{ p.name }}</td>
                  <td class="px-4 py-3">{{ p.scope === 'GLOBAL' ? 'Global' : 'Particular' }}</td>
                  <td class="px-4 py-3">{{ p.verificationStatus ?? '—' }}</td>
                  <td class="px-4 py-3 text-right">
                    @if (canSetScope()) {
                      <button class="text-xs text-blue-600 hover:underline dark:text-blue-400" (click)="openDialog(p)">Definir escopo</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    @if (dialogTarget(); as target) {
      <app-scope-dialog
        [professional]="target"
        [saving]="saving()"
        (confirmScope)="applyScope($event)"
        (close)="dialogTarget.set(null)"
      />
    }
  `,
})
export class ProfessionalsListPage {
  private readonly svc = inject(ProfessionalService);
  private readonly appState = inject(AppStateService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly tab = signal<Tab>('voice-actors');
  readonly scopeFilter = signal<ServiceScope | ''>('');
  readonly professionals = signal<Professional[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly dialogTarget = signal<Professional | null>(null);

  readonly canSetScope = computed(() => this.appState.isAdmin() || this.appState.isReseller());

  constructor() {
    this.load();
  }

  setTab(tab: Tab): void {
    if (this.tab() === tab) return;
    this.tab.set(tab);
    this.load();
  }

  onScope(value: string): void {
    this.scopeFilter.set((value as ServiceScope) || '');
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    const filters = { scope: this.scopeFilter() || undefined };
    const req =
      this.tab() === 'voice-actors'
        ? this.svc.listVoiceActors(filters)
        : this.svc.listProducers(filters);
    req.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.professionals.set(res.professionals ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.notify.error(err.message ?? 'Erro ao carregar profissionais');
        this.loading.set(false);
      },
    });
  }

  openDialog(p: Professional): void {
    this.dialogTarget.set(p);
  }

  applyScope(dto: SetScopeDto): void {
    const target = this.dialogTarget();
    if (!target) return;
    this.saving.set(true);
    this.svc.setScope(this.tab(), target.id, dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogTarget.set(null);
        this.notify.success('Escopo atualizado.');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        // 409 = profissional com pedidos ativos; a API rejeita a alteração.
        this.notify.error(err.message ?? 'Não foi possível alterar o escopo (pode haver pedidos ativos).');
      },
    });
  }
}
