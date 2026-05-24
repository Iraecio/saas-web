import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { WalletAdminService } from '../../services/wallet-admin';
import { WalletSummary } from '../../../../core/models/wallet.model';

@Component({
  selector: 'app-wallets-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Carteiras</h1>
        <p class="mt-1 text-sm text-neutral-500">Gestão de carteiras de todos os usuários</p>
      </header>

      <!-- Busca -->
      <div class="flex gap-3">
        <input type="text" [value]="userIdSearch()" (input)="onSearchInput($event)"
          placeholder="Buscar por User ID..."
          class="form-input text-sm w-64" />
        <button (click)="loadWallets()" class="px-4 py-2 text-sm bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Buscar
        </button>
      </div>

      <!-- Tabela -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        @if (loading()) {
          <div class="flex justify-center py-12">
            <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (wallets().length === 0) {
          <p class="text-neutral-500 text-sm text-center py-12">Nenhuma carteira encontrada.</p>
        } @else {
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Usuário</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Saldo</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Créditos</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Criado em</th>
                <th class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              @for (wallet of wallets(); track wallet.id) {
                <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td class="px-6 py-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">{{ wallet.userId }}</td>
                  <td class="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                    {{ wallet.balance | number:'1.2-2' }} <span class="text-xs font-normal text-neutral-500">{{ wallet.currency }}</span>
                  </td>
                  <td class="px-6 py-4 text-neutral-700 dark:text-neutral-300">{{ wallet.creditCount }}</td>
                  <td class="px-6 py-4 text-neutral-500 text-xs">{{ wallet.createdAt | date:'dd/MM/yyyy' }}</td>
                  <td class="px-6 py-4 text-right">
                    <a [routerLink]="[wallet.userId]" class="text-xs text-primary-600 hover:underline">Ver detalhes</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Paginação -->
          <div class="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
            <button (click)="prevPage()" [disabled]="currentPage() === 1"
              class="text-sm px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              ← Anterior
            </button>
            <span class="text-sm text-neutral-500">Página {{ currentPage() }}</span>
            <button (click)="nextPage()" [disabled]="wallets().length < pageSize"
              class="text-sm px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              Próxima →
            </button>
          </div>
        }
      </section>
    </div>
  `,
})
export class WalletsListPage implements OnInit {
  private readonly walletAdminService = inject(WalletAdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly wallets = signal<WalletSummary[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);
  readonly userIdSearch = signal('');
  readonly pageSize = 20;

  ngOnInit(): void {
    this.loadWallets();
  }

  onSearchInput(event: Event): void {
    this.userIdSearch.set((event.target as HTMLInputElement).value);
  }

  loadWallets(): void {
    this.loading.set(true);
    this.walletAdminService
      .listWallets({
        page: this.currentPage(),
        limit: this.pageSize,
        userId: this.userIdSearch() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (w) => { this.wallets.set(w); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  nextPage(): void {
    this.currentPage.update((p) => p + 1);
    this.loadWallets();
  }

  prevPage(): void {
    if (this.currentPage() <= 1) return;
    this.currentPage.update((p) => p - 1);
    this.loadWallets();
  }
}
