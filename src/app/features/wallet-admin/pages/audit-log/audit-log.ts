import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, SlicePipe } from '@angular/common';
import { WalletAdminService } from '../../services/wallet-admin';
import { WalletAuditLogEntry } from '../../../../core/models/wallet.model';

@Component({
  selector: 'app-audit-log',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, SlicePipe],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Log de Auditoria</h1>
        <p class="mt-1 text-sm text-neutral-500">Rastreio de todas as operações realizadas na plataforma</p>
      </header>

      <!-- Filtros -->
      <div class="grid grid-cols-3 gap-3">
        <input type="text" [value]="filters.walletId" (input)="onInput($event, 'walletId')"
          placeholder="Wallet ID" class="form-input text-sm" />
        <input type="text" [value]="filters.creditId" (input)="onInput($event, 'creditId')"
          placeholder="Credit ID" class="form-input text-sm" />
        <input type="text" [value]="filters.action" (input)="onInput($event, 'action')"
          placeholder="Ação (ex: ISSUE, CANCEL...)" class="form-input text-sm" />
      </div>
      <button (click)="search()" class="px-4 py-2 text-sm bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:opacity-90 transition-opacity">
        Buscar
      </button>

      <!-- Tabela -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        @if (loading()) {
          <div class="flex justify-center py-12">
            <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (entries().length === 0) {
          <p class="text-sm text-neutral-500 text-center py-12">Nenhuma entrada encontrada.</p>
        } @else {
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Ação</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Realizado por</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Wallet ID</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Credit ID</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Data/Hora</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              @for (entry of entries(); track entry.id) {
                <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-mono font-medium text-neutral-700 dark:text-neutral-300">
                      {{ entry.action }}
                    </span>
                  </td>
                  <td class="px-4 py-3 font-mono text-xs text-neutral-500">{{ entry.performedBy | slice:0:8 }}…</td>
                  <td class="px-4 py-3 font-mono text-xs text-neutral-500">
                    @if (entry.walletId) { {{ entry.walletId | slice:0:8 }}… } @else { — }
                  </td>
                  <td class="px-4 py-3 font-mono text-xs text-neutral-500">
                    @if (entry.creditId) { {{ entry.creditId | slice:0:8 }}… } @else { — }
                  </td>
                  <td class="px-4 py-3 text-neutral-500 text-xs">{{ entry.createdAt | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Paginação -->
          <div class="flex items-center justify-between px-4 py-4 border-t border-neutral-200 dark:border-neutral-800">
            <button (click)="prevPage()" [disabled]="currentPage() === 1"
              class="text-sm px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-50 transition-colors">
              ← Anterior
            </button>
            <span class="text-sm text-neutral-500">Página {{ currentPage() }}</span>
            <button (click)="nextPage()" [disabled]="entries().length < pageSize"
              class="text-sm px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-50 transition-colors">
              Próxima →
            </button>
          </div>
        }
      </section>
    </div>
  `,
})
export class AuditLogPage implements OnInit {
  private readonly walletAdminService = inject(WalletAdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly entries = signal<WalletAuditLogEntry[]>([]);
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = 50;

  filters: { walletId: string; creditId: string; action: string } = {
    walletId: '',
    creditId: '',
    action: '',
  };

  ngOnInit(): void {
    this.loadEntries();
  }

  onInput(event: Event, field: 'walletId' | 'creditId' | 'action'): void {
    this.filters[field] = (event.target as HTMLInputElement).value;
  }

  search(): void {
    this.currentPage.set(1);
    this.loadEntries();
  }

  nextPage(): void {
    this.currentPage.update((p) => p + 1);
    this.loadEntries();
  }

  prevPage(): void {
    if (this.currentPage() <= 1) return;
    this.currentPage.update((p) => p - 1);
    this.loadEntries();
  }

  private loadEntries(): void {
    this.loading.set(true);
    this.walletAdminService
      .getAuditLog({
        walletId: this.filters.walletId || undefined,
        creditId: this.filters.creditId || undefined,
        action: this.filters.action || undefined,
        page: this.currentPage(),
        limit: this.pageSize,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (e) => { this.entries.set(e); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }
}
