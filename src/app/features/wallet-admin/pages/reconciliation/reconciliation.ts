import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletAdminService } from '../../services/wallet-admin';
import { AppStateService } from '../../../../core/services/app-state';
import { ReconciliationResult } from '../../../../core/models/wallet.model';

@Component({
  selector: 'app-reconciliation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, FormsModule],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Reconciliação</h1>
        <p class="mt-1 text-sm text-neutral-500">Verificar consistência dos saldos de carteiras</p>
      </header>

      <!-- Confirmação de correção -->
      @if (confirmingCorrection()) {
        <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 max-w-md w-full space-y-4">
            <h3 class="text-lg font-bold text-neutral-900 dark:text-white">Confirmar Correção</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              Informe o motivo da correção da reconciliação da carteira <span class="font-mono">{{ confirmingCorrection()!.walletId | slice:0:12 }}…</span>
            </p>
            <textarea [(ngModel)]="correctionReason" rows="3" class="form-input w-full text-sm"
              placeholder="Motivo da correção...">
            </textarea>
            @if (correctionError()) {
              <p class="text-sm text-red-500">{{ correctionError() }}</p>
            }
            <div class="flex justify-end gap-3">
              <button (click)="confirmingCorrection.set(null)"
                class="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400">Cancelar</button>
              <button (click)="doCorrection()" [disabled]="!correctionReason.trim() || correcting()"
                class="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-amber-700 transition-colors">
                {{ correcting() ? 'Corrigindo...' : 'Confirmar Correção' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Filtros -->
      <div class="flex gap-3">
        <select [value]="statusFilter()" (change)="onStatusChange($event)" class="form-input text-sm w-auto">
          <option value="">Todos</option>
          <option value="OK">OK</option>
          <option value="MISMATCH">Divergência</option>
        </select>
        <button (click)="loadResults()" class="px-4 py-2 text-sm bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Atualizar
        </button>
      </div>

      <!-- Tabela -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        @if (loading()) {
          <div class="flex justify-center py-12">
            <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (results().length === 0) {
          <p class="text-sm text-neutral-500 text-center py-12">Nenhum resultado encontrado.</p>
        } @else {
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Carteira</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Esperado</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Real</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Diferença</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Verificado</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              @for (result of results(); track result.id) {
                <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  [class.bg-red-50]="result.status === 'MISMATCH'"
                  [class.dark:bg-red-900/10]="result.status === 'MISMATCH'">
                  <td class="px-4 py-3 font-mono text-xs text-neutral-500">{{ result.walletId | slice:0:12 }}…</td>
                  <td class="px-4 py-3 text-neutral-700 dark:text-neutral-300">{{ result.expectedBalance | number:'1.2-2' }}</td>
                  <td class="px-4 py-3 text-neutral-700 dark:text-neutral-300">{{ result.actualBalance | number:'1.2-2' }}</td>
                  <td class="px-4 py-3 font-semibold" [class]="result.difference !== 0 ? 'text-red-600 dark:text-red-400' : 'text-neutral-500'">
                    {{ result.difference | number:'1.2-2' }}
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                      [class]="result.status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ result.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-neutral-500 text-xs">{{ result.checkedAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="px-4 py-3 text-right">
                    @if (result.status === 'MISMATCH' && isSuperAdmin()) {
                      <button (click)="openCorrection(result)"
                        class="text-xs text-amber-600 hover:text-amber-800 font-medium">
                        Corrigir
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </section>
    </div>
  `,
})
export class ReconciliationPage implements OnInit {
  private readonly walletAdminService = inject(WalletAdminService);
  private readonly appState = inject(AppStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly results = signal<ReconciliationResult[]>([]);
  readonly loading = signal(true);
  readonly statusFilter = signal('');
  readonly confirmingCorrection = signal<ReconciliationResult | null>(null);
  readonly correcting = signal(false);
  readonly correctionError = signal<string | undefined>(undefined);
  correctionReason = '';

  readonly isSuperAdmin = () => this.appState.user()?.role === 'SUPER_ADMIN';

  ngOnInit(): void {
    this.loadResults();
  }

  onStatusChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
    this.loadResults();
  }

  loadResults(): void {
    this.loading.set(true);
    this.walletAdminService
      .getReconciliationResults({ status: this.statusFilter() || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => { this.results.set(r); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  openCorrection(result: ReconciliationResult): void {
    this.confirmingCorrection.set(result);
    this.correctionReason = '';
    this.correctionError.set(undefined);
  }

  doCorrection(): void {
    const result = this.confirmingCorrection();
    if (!result || !this.correctionReason.trim()) return;
    this.correcting.set(true);
    this.walletAdminService
      .correctReconciliation(result.id, this.correctionReason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.correcting.set(false);
          this.confirmingCorrection.set(null);
          this.loadResults();
        },
        error: (err: Error) => {
          this.correcting.set(false);
          this.correctionError.set(err.message ?? 'Erro ao corrigir reconciliação');
        },
      });
  }
}
