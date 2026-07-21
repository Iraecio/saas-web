import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { WalletAdminService } from '../../services/wallet-admin';
import { WalletSummary } from '../../../../core/models/wallet.model';

@Component({
  selector: 'app-wallet-detail-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <header class="flex items-center gap-4">
        <a routerLink="../" class="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">← Voltar</a>
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Detalhes da Carteira</h1>
          <p class="text-sm text-neutral-500 mt-1 font-mono">{{ userId() }}</p>
        </div>
      </header>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (wallet()) {
        <!-- Saldo -->
        <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div class="text-center">
            <p class="text-sm text-neutral-500 mb-1">Saldo da carteira</p>
            <p class="text-4xl font-bold text-neutral-900 dark:text-white">
              {{ wallet()!.availableCredits | number }}
              <span class="text-xl font-normal text-neutral-500">{{ wallet()!.currency }}</span>
            </p>
            <p class="text-xs text-neutral-400 mt-2">{{ wallet()!.frozenCredits }} reservados · Criado em {{ wallet()!.createdAt | date:'dd/MM/yyyy' }}</p>
          </div>
        </section>

        <!-- Ações rápidas -->
        <div class="flex gap-3">
          <a [routerLink]="['/admin/wallet-admin/credits']" [queryParams]="{ userId: userId() }"
            class="flex-1 text-center px-4 py-2.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors text-neutral-700 dark:text-neutral-300">
            Ver créditos
          </a>
          <a [routerLink]="['/admin/wallet-admin/issue-credits']" [queryParams]="{ userId: userId() }"
            class="flex-1 text-center px-4 py-2.5 text-sm bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity font-medium">
            Emitir crédito
          </a>
        </div>
      }
    </div>
  `,
})
export class WalletDetailAdminPage implements OnInit {
  private readonly walletAdminService = inject(WalletAdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly wallet = signal<WalletSummary | null>(null);
  readonly loading = signal(true);
  readonly userId = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('userId') ?? '';
    this.userId.set(id);
    this.walletAdminService
      .getWalletDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (w) => { this.wallet.set(w); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }
}
