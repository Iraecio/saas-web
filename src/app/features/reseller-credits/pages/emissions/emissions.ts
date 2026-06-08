import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../../../core/services/notification';
import { ResellerCreditService } from '../../services/reseller-credit';
import {
  CreditEmission,
  EmissionsSummary,
} from '../../../../core/models/reseller-credit.model';

@Component({
  selector: 'app-emissions-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Emissões de créditos</h1>
          <p class="mt-1 text-sm text-neutral-500">Relatório de créditos RESELLER emitidos</p>
        </div>
        <a routerLink="../emit" class="btn-primary">+ Emitir</a>
      </header>

      <div class="flex flex-col gap-3 sm:flex-row">
        <input type="date" class="form-input sm:w-44" [value]="startDate()" (change)="startDate.set($any($event.target).value)" />
        <input type="date" class="form-input sm:w-44" [value]="endDate()" (change)="endDate.set($any($event.target).value)" />
        <button class="btn-secondary" (click)="load()">Filtrar</button>
      </div>

      @if (summary(); as s) {
        <div class="grid grid-cols-3 gap-3">
          <div class="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
            <p class="text-xs text-neutral-500">Emissões</p>
            <p class="text-2xl font-bold">{{ s.totalEmissions | number }}</p>
          </div>
          <div class="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
            <p class="text-xs text-neutral-500">Créditos emitidos</p>
            <p class="text-2xl font-bold">{{ s.totalCreditsEmitted | number }}</p>
          </div>
          <div class="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
            <p class="text-xs text-neutral-500">Créditos utilizados</p>
            <p class="text-2xl font-bold">{{ s.totalVolumeUsedCredits | number }}</p>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (emissions().length === 0) {
        <p class="py-12 text-center text-sm text-neutral-500">Nenhuma emissão no período.</p>
      } @else {
        <div class="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 dark:bg-neutral-900 text-left text-neutral-500">
              <tr>
                <th class="px-4 py-3 font-medium">Data</th>
                <th class="px-4 py-3 font-medium">Cliente</th>
                <th class="px-4 py-3 font-medium text-right">Créditos</th>
                <th class="px-4 py-3 font-medium text-right">Valor unit.</th>
                <th class="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              @for (e of emissions(); track e.emissionId) {
                <tr class="bg-white dark:bg-neutral-950">
                  <td class="px-4 py-3">{{ e.emittedAt | date: 'short' }}</td>
                  <td class="px-4 py-3 font-mono text-xs">{{ e.clientId.slice(0, 8) }}</td>
                  <td class="px-4 py-3 text-right">{{ e.creditAmount | number }}</td>
                  <td class="px-4 py-3 text-right">R$ {{ (e.unitValueCents / 100) | number: '1.2-2' }}</td>
                  <td class="px-4 py-3 text-right">R$ {{ (e.totalValueCents / 100) | number: '1.2-2' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class EmissionsReportPage {
  private readonly svc = inject(ResellerCreditService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly emissions = signal<CreditEmission[]>([]);
  readonly summary = signal<EmissionsSummary | null>(null);
  readonly loading = signal(true);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.svc
      .listEmissions({
        startDate: this.startDate() || undefined,
        endDate: this.endDate() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (report) => {
          this.emissions.set(report.emissions ?? []);
          this.summary.set(report.summary ?? null);
          this.loading.set(false);
        },
        error: (err) => {
          this.notify.error(err.message ?? 'Erro ao carregar emissões');
          this.loading.set(false);
        },
      });
  }
}
