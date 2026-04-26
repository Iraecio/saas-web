import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RoleRequest, RoleRequestStatus } from '../../../../core/models/role-request.model';
import { RoleRequestService } from '../../services/role-request';

const ROLE_LABEL: Record<string, string> = {
  RESELLER: 'Revendedor',
  VOICE_ACTOR: 'Locutor',
  PRODUCER: 'Produtor',
  CLIENT: 'Cliente',
};

@Component({
  selector: 'app-role-requests-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="p-6 space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Solicitações de Papel</h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Aprove ou rejeite pedidos de mudança de papel
        </p>
      </header>

      <!-- Filtros -->
      <div class="flex gap-2 flex-wrap">
        @for (filter of filters; track filter.value) {
          <button (click)="setStatus(filter.value)"
                  class="rounded-lg px-4 py-2 text-sm font-medium transition"
                  [class.bg-violet-600]="status() === filter.value"
                  [class.text-white]="status() === filter.value"
                  [class.bg-white]="status() !== filter.value"
                  [class.text-neutral-700]="status() !== filter.value"
                  [class.ring-1]="status() !== filter.value"
                  [class.ring-neutral-200]="status() !== filter.value"
                  [class.dark:bg-neutral-800]="status() !== filter.value"
                  [class.dark:text-neutral-300]="status() !== filter.value"
                  [class.dark:ring-neutral-700]="status() !== filter.value">
            {{ filter.label }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent"></div>
        </div>
      } @else if (requests().length === 0) {
        <div class="rounded-xl border-2 border-dashed border-neutral-200 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-800">
          <div class="text-5xl">📭</div>
          <h2 class="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Nenhuma solicitação {{ statusFilterLabel() }}
          </h2>
        </div>
      } @else {
        <div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
          <table class="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead class="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Usuário</th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Papel</th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Data</th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-700">
              @for (req of requests(); track req.id) {
                <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                  <td class="px-5 py-4 text-sm">
                    <p class="font-medium text-neutral-900 dark:text-white">{{ req.user?.name || req.user?.email }}</p>
                    <p class="text-xs text-neutral-500">{{ req.user?.email }}</p>
                  </td>
                  <td class="px-5 py-4 text-sm">
                    <span class="rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/20 dark:text-violet-400">
                      {{ roleLabel(req.requestedRole) }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                    {{ formatDate(req.createdAt) }}
                  </td>
                  <td class="px-5 py-4 text-sm">
                    <span class="rounded-full px-3 py-1 text-xs font-semibold"
                          [class]="statusBadgeClass(req.status)">
                      {{ statusLabel(req.status) }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-right text-sm">
                    <button (click)="openDetails(req)"
                            class="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200 transition">
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Modal de detalhes -->
      @if (selected(); as req) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
             (click)="closeDetails()">
          <div class="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto dark:bg-neutral-800"
               (click)="$event.stopPropagation()">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-xl font-bold text-neutral-900 dark:text-white">
                  Solicitação para {{ roleLabel(req.requestedRole) }}
                </h2>
                <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {{ req.user?.name || '' }} · {{ req.user?.email }}
                </p>
              </div>
              <button (click)="closeDetails()"
                      class="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                ✕
              </button>
            </div>

            <div class="mt-6 space-y-4">
              <div>
                <h3 class="text-xs font-semibold uppercase tracking-wider text-neutral-500">Justificativa</h3>
                <p class="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{{ req.justification }}</p>
              </div>

              @if (req.portfolioNotes) {
                <div>
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-neutral-500">Notas de Portfólio</h3>
                  <p class="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{{ req.portfolioNotes }}</p>
                </div>
              }

              @if (req.voiceStyles && req.voiceStyles.length > 0) {
                <div>
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-neutral-500">Estilos de voz</h3>
                  <div class="mt-2 flex flex-wrap gap-2">
                    @for (style of req.voiceStyles; track style) {
                      <span class="rounded-md bg-violet-50 px-2 py-1 text-xs text-violet-700 dark:bg-violet-900/20 dark:text-violet-400">
                        {{ style }}
                      </span>
                    }
                  </div>
                </div>
              }

              @if (req.companyName) {
                <div>
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-neutral-500">Empresa</h3>
                  <p class="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{{ req.companyName }}</p>
                </div>
              }

              @if (req.specialty) {
                <div>
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-neutral-500">Especialidade</h3>
                  <p class="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{{ req.specialty }}</p>
                </div>
              }

              <div class="border-t border-neutral-200 pt-4 dark:border-neutral-700">
                <p class="text-xs text-neutral-500">
                  Criada em {{ formatDate(req.createdAt) }}
                  @if (req.reviewedAt) {
                    · Revisada em {{ formatDate(req.reviewedAt) }}
                  }
                </p>
              </div>

              @if (req.status === 'REJECTED' && req.rejectionReason) {
                <div class="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                  <p class="text-sm text-red-700 dark:text-red-400">
                    <strong>Motivo da rejeição:</strong> {{ req.rejectionReason }}
                  </p>
                </div>
              }
            </div>

            @if (req.status === 'PENDING') {
              <div class="mt-6 border-t border-neutral-200 pt-6 dark:border-neutral-700">
                @if (showRejectForm()) {
                  <div class="space-y-3">
                    <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Motivo da rejeição (opcional)
                    </label>
                    <textarea [(ngModel)]="rejectReason" rows="3" name="reason"
                              placeholder="Explique brevemente o motivo..."
                              class="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"></textarea>
                    <div class="flex justify-end gap-2">
                      <button (click)="cancelReject()"
                              class="rounded-lg px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700">
                        Cancelar
                      </button>
                      <button (click)="confirmReject(req)"
                              [disabled]="actionLoading()"
                              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                        Confirmar Rejeição
                      </button>
                    </div>
                  </div>
                } @else {
                  @if (actionError()) {
                    <div class="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                      {{ actionError() }}
                    </div>
                  }
                  <div class="flex justify-end gap-2">
                    <button (click)="startReject()"
                            class="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400">
                      ❌ Rejeitar
                    </button>
                    <button (click)="approve(req)"
                            [disabled]="actionLoading()"
                            class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                      ✅ Aprovar
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class RoleRequestsAdminComponent implements OnInit {
  private readonly roleRequestService = inject(RoleRequestService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly actionLoading = signal(false);
  protected readonly actionError = signal<string | undefined>(undefined);
  protected readonly requests = signal<RoleRequest[]>([]);
  protected readonly status = signal<RoleRequestStatus | undefined>('PENDING');
  protected readonly selected = signal<RoleRequest | null>(null);
  protected readonly showRejectForm = signal(false);
  protected rejectReason = '';

  protected readonly filters: Array<{ label: string; value: RoleRequestStatus | undefined }> = [
    { label: 'Pendentes', value: 'PENDING' },
    { label: 'Aprovados', value: 'APPROVED' },
    { label: 'Rejeitados', value: 'REJECTED' },
    { label: 'Todos', value: undefined },
  ];

  ngOnInit(): void {
    this.fetch();
  }

  protected statusFilterLabel(): string {
    const current = this.status();
    if (current === 'PENDING') return 'pendente';
    if (current === 'APPROVED') return 'aprovada';
    if (current === 'REJECTED') return 'rejeitada';
    return '';
  }

  protected setStatus(status: RoleRequestStatus | undefined): void {
    this.status.set(status);
    this.fetch();
  }

  private fetch(): void {
    this.loading.set(true);
    this.roleRequestService
      .listAll({ status: this.status() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.requests.set(response.items);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  protected openDetails(req: RoleRequest): void {
    this.selected.set(req);
    this.showRejectForm.set(false);
    this.rejectReason = '';
    this.actionError.set(undefined);
  }

  protected closeDetails(): void {
    this.selected.set(null);
    this.showRejectForm.set(false);
    this.rejectReason = '';
  }

  protected startReject(): void {
    this.showRejectForm.set(true);
  }

  protected cancelReject(): void {
    this.showRejectForm.set(false);
    this.rejectReason = '';
  }

  protected approve(req: RoleRequest): void {
    this.actionLoading.set(true);
    this.actionError.set(undefined);
    this.roleRequestService
      .approve(req.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionLoading.set(false);
          this.closeDetails();
          this.fetch();
        },
        error: (err) => {
          this.actionLoading.set(false);
          this.actionError.set(err?.error?.message ?? 'Erro ao aprovar');
        },
      });
  }

  protected confirmReject(req: RoleRequest): void {
    this.actionLoading.set(true);
    this.actionError.set(undefined);
    this.roleRequestService
      .reject(req.id, this.rejectReason || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionLoading.set(false);
          this.closeDetails();
          this.fetch();
        },
        error: (err) => {
          this.actionLoading.set(false);
          this.actionError.set(err?.error?.message ?? 'Erro ao rejeitar');
        },
      });
  }

  protected roleLabel(role: string): string {
    return ROLE_LABEL[role] ?? role;
  }

  protected statusLabel(status: string): string {
    if (status === 'PENDING') return 'Em análise';
    if (status === 'APPROVED') return 'Aprovado';
    if (status === 'REJECTED') return 'Rejeitado';
    return status;
  }

  protected statusBadgeClass(status: string): string {
    if (status === 'PENDING')
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    if (status === 'APPROVED')
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (status === 'REJECTED')
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-neutral-100 text-neutral-700';
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
