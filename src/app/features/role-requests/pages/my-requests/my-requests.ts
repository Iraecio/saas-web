import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { RoleRequest } from '../../../../core/models/role-request.model';
import { RoleRequestService } from '../../services/role-request';

const ROLE_LABEL: Record<string, string> = {
  RESELLER: 'Revendedor',
  VOICE_ACTOR: 'Locutor',
  PRODUCER: 'Produtor',
  CLIENT: 'Cliente',
};

@Component({
  selector: 'app-my-requests',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-4xl p-6 space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Minhas Solicitações</h1>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Histórico de pedidos de mudança de papel
          </p>
        </div>
        @if (!hasPending()) {
          <a routerLink="/admin/role-requests/new"
             class="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-violet-700">
            🎯 Nova Solicitação
          </a>
        }
      </header>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent"></div>
        </div>
      } @else if (requests().length === 0) {
        <div class="rounded-xl border-2 border-dashed border-neutral-200 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-800">
          <div class="text-5xl">📋</div>
          <h2 class="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Você ainda não fez nenhuma solicitação
          </h2>
          <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Solicite mudança de papel para atuar como Revendedor, Locutor ou Produtor.
          </p>
          <a routerLink="/admin/role-requests/new"
             class="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-violet-700">
            Criar primeira solicitação
          </a>
        </div>
      } @else {
        <ul class="space-y-3">
          @for (req of requests(); track req.id) {
            <li class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                       [class]="statusBgClass(req.status)">
                    {{ statusIcon(req.status) }}
                  </div>
                  <div>
                    <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
                      {{ roleLabel(req.requestedRole) }}
                    </h3>
                    <p class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      Criada em {{ formatDate(req.createdAt) }}
                      @if (req.reviewedAt) {
                        · Revisada em {{ formatDate(req.reviewedAt) }}
                      }
                    </p>
                    @if (req.justification) {
                      <p class="mt-2 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
                        "{{ req.justification }}"
                      </p>
                    }
                    @if (req.status === 'REJECTED' && req.rejectionReason) {
                      <p class="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        <strong>Motivo da rejeição:</strong> {{ req.rejectionReason }}
                      </p>
                    }
                  </div>
                </div>
                <span class="rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap"
                      [class]="statusBadgeClass(req.status)">
                  {{ statusLabel(req.status) }}
                </span>
              </div>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class MyRequestsComponent implements OnInit {
  private readonly roleRequestService = inject(RoleRequestService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly requests = signal<RoleRequest[]>([]);

  protected readonly hasPending = computed(() =>
    this.requests().some((r) => r.status === 'PENDING'),
  );

  ngOnInit(): void {
    this.roleRequestService
      .listMine()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (requests) => {
          this.requests.set(requests);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
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

  protected statusIcon(status: string): string {
    if (status === 'PENDING') return '⏳';
    if (status === 'APPROVED') return '✅';
    if (status === 'REJECTED') return '❌';
    return '📋';
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

  protected statusBgClass(status: string): string {
    if (status === 'PENDING') return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (status === 'APPROVED') return 'bg-emerald-100 dark:bg-emerald-900/30';
    if (status === 'REJECTED') return 'bg-red-100 dark:bg-red-900/30';
    return 'bg-neutral-100 dark:bg-neutral-700';
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
