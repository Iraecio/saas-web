import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, SlicePipe } from '@angular/common';
import { WalletAdminService } from '../../services/wallet-admin';
import { Dispute, DisputeStatus } from '../../../../core/models/wallet.model';

@Component({
  selector: 'app-disputes-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DatePipe, SlicePipe],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Disputas</h1>
        <p class="mt-1 text-sm text-neutral-500">Gerenciar disputas dos usuários</p>
      </header>

      <!-- Filtro de status -->
      <select [value]="statusFilter()" (change)="onStatusChange($event)" class="form-input text-sm w-auto">
        <option value="">Todos os status</option>
        <option value="OPENED">Aberta</option>
        <option value="INVESTIGATING">Investigando</option>
        <option value="RESOLVED">Resolvida</option>
        <option value="CHARGEBACK_FILED">Chargeback</option>
      </select>

      <!-- Dialog de atualização -->
      @if (editingDispute()) {
        <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 max-w-lg w-full space-y-4">
            <h3 class="text-lg font-bold text-neutral-900 dark:text-white">Atualizar Disputa</h3>
            <form [formGroup]="updateForm" (ngSubmit)="submitUpdate()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Status</label>
                <select formControlName="status" class="form-input w-full text-sm">
                  <option value="OPENED">Aberta</option>
                  <option value="INVESTIGATING">Investigando</option>
                  <option value="RESOLVED">Resolvida</option>
                  <option value="CHARGEBACK_FILED">Chargeback</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Notas de investigação</label>
                <textarea formControlName="investigationNotes" rows="3" class="form-input w-full text-sm"
                  placeholder="Adicione notas sobre a investigação..."></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Resolução</label>
                <textarea formControlName="resolution" rows="2" class="form-input w-full text-sm"
                  placeholder="Descreva a resolução (se aplicável)..."></textarea>
              </div>
              @if (updateError()) {
                <p class="text-sm text-red-500">{{ updateError() }}</p>
              }
              <div class="flex justify-end gap-3">
                <button type="button" (click)="editingDispute.set(null)"
                  class="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                  Cancelar
                </button>
                <button type="submit" [disabled]="updating()"
                  class="px-4 py-2 text-sm bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium disabled:opacity-50 hover:opacity-90 transition-opacity">
                  {{ updating() ? 'Salvando...' : 'Salvar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Tabela -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        @if (loading()) {
          <div class="flex justify-center py-12">
            <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (disputes().length === 0) {
          <p class="text-sm text-neutral-500 text-center py-12">Nenhuma disputa encontrada.</p>
        } @else {
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Crédito</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Motivo</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Data</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              @for (dispute of disputes(); track dispute.id) {
                <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td class="px-4 py-3 font-mono text-xs text-neutral-500">{{ dispute.creditId | slice:0:8 }}…</td>
                  <td class="px-4 py-3 text-neutral-700 dark:text-neutral-300 max-w-xs truncate">{{ dispute.reason }}</td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="statusBadge(dispute.status)">
                      {{ dispute.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-neutral-500 text-xs">{{ dispute.createdAt | date:'dd/MM/yyyy' }}</td>
                  <td class="px-4 py-3 text-right">
                    <button (click)="openEdit(dispute)"
                      class="text-xs text-primary-600 hover:underline">Atualizar</button>
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
export class DisputesAdminPage implements OnInit {
  private readonly walletAdminService = inject(WalletAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly disputes = signal<Dispute[]>([]);
  readonly loading = signal(true);
  readonly statusFilter = signal('');
  readonly editingDispute = signal<Dispute | null>(null);
  readonly updating = signal(false);
  readonly updateError = signal<string | undefined>(undefined);

  readonly updateForm = this.fb.nonNullable.group({
    status: ['OPENED' as DisputeStatus],
    investigationNotes: [''],
    resolution: [''],
  });

  ngOnInit(): void {
    this.loadDisputes();
  }

  onStatusChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
    this.loadDisputes();
  }

  openEdit(dispute: Dispute): void {
    this.editingDispute.set(dispute);
    this.updateError.set(undefined);
    this.updateForm.patchValue({
      status: dispute.status,
      investigationNotes: dispute.investigationNotes ?? '',
      resolution: dispute.resolution ?? '',
    });
  }

  submitUpdate(): void {
    const dispute = this.editingDispute();
    if (!dispute) return;
    this.updating.set(true);
    this.updateError.set(undefined);

    const { status, investigationNotes, resolution } = this.updateForm.getRawValue();
    this.walletAdminService
      .updateDispute(dispute.id, {
        status,
        investigationNotes: investigationNotes || undefined,
        resolution: resolution || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.disputes.update((d) =>
            d.map((x) => (x.id === updated.id ? updated : x)),
          );
          this.updating.set(false);
          this.editingDispute.set(null);
        },
        error: (err: Error) => {
          this.updating.set(false);
          this.updateError.set(err.message ?? 'Erro ao atualizar disputa');
        },
      });
  }

  private loadDisputes(): void {
    this.loading.set(true);
    this.walletAdminService
      .listDisputes({ status: this.statusFilter() || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (d) => { this.disputes.set(d); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  statusBadge(status: DisputeStatus): string {
    const map: Record<DisputeStatus, string> = {
      OPENED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      INVESTIGATING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      CHARGEBACK_FILED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    };
    return map[status] ?? 'bg-neutral-100 text-neutral-800';
  }
}
