import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WalletAdminService } from '../../services/wallet-admin';
import { WalletAnalytics } from '../../../../core/models/wallet.model';

@Component({
  selector: 'app-analytics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DecimalPipe],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Analytics Financeiro</h1>
        <p class="mt-1 text-sm text-neutral-500">Visão geral das finanças da plataforma</p>
      </header>

      <!-- Filtro de período -->
      <form [formGroup]="periodForm" (ngSubmit)="loadAnalytics()" class="flex items-end gap-3">
        <div>
          <label class="block text-xs font-medium text-neutral-500 mb-1">De</label>
          <input type="date" formControlName="from" class="form-input text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-neutral-500 mb-1">Até</label>
          <input type="date" formControlName="to" class="form-input text-sm" />
        </div>
        <button type="submit"
          class="px-4 py-2 text-sm bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Aplicar
        </button>
      </form>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (analytics()) {
        <!-- Cards de resumo -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <p class="text-xs text-neutral-500 mb-1">Total Emitido</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ analytics()!.totalIssued | number }}
            </p>
          </div>

          <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <p class="text-xs text-neutral-500 mb-1">Total Gasto</p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ analytics()!.totalSpent | number }}
            </p>
          </div>

          <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <p class="text-xs text-neutral-500 mb-1">Total Reembolsos</p>
            <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {{ analytics()!.totalRefunded | number }}
            </p>
          </div>

          <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <p class="text-xs text-neutral-500 mb-1">Total Expirado</p>
            <p class="text-2xl font-bold text-red-600 dark:text-red-400">
              {{ analytics()!.totalExpired | number }}
            </p>
          </div>

          <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 col-span-2 md:col-span-1">
            <p class="text-xs text-neutral-500 mb-1">Percentual consumido</p>
            <p class="text-2xl font-bold text-neutral-900 dark:text-white">
              {{ analytics()!.totalIssued ? (analytics()!.totalSpent / analytics()!.totalIssued * 100 | number:'1.1-1') : 0 }}%
            </p>
            <!-- Barra de progresso -->
            <div class="mt-2 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full transition-all"
                [style.width.%]="analytics()!.totalIssued ? analytics()!.totalSpent / analytics()!.totalIssued * 100 : 0"></div>
            </div>
          </div>
        </div>

        <!-- Período analisado -->
        <p class="text-xs text-neutral-400 text-center">
          Período selecionado nos filtros acima.
        </p>
      } @else {
        <p class="text-neutral-500 text-sm text-center py-8">Selecione um período para ver os dados.</p>
      }
    </div>
  `,
})
export class AnalyticsPage implements OnInit {
  private readonly walletAdminService = inject(WalletAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly analytics = signal<WalletAnalytics | null>(null);
  readonly loading = signal(false);

  readonly periodForm = this.fb.nonNullable.group({
    from: [this.defaultFrom()],
    to: [this.defaultTo()],
  });

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading.set(true);
    const { from, to } = this.periodForm.getRawValue();
    this.walletAdminService
      .getAnalytics({ from: from || undefined, to: to || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (a) => { this.analytics.set(a); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  private defaultFrom(): string {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  }

  private defaultTo(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
