import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, JsonPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../../../core/services/notification';
import { ServiceCatalogService } from '../../services/service-catalog';
import { ServiceAuditEntry } from '../../../../core/models/service.model';

@Component({
  selector: 'app-service-audit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, JsonPipe],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Histórico do serviço</h1>
          <p class="mt-1 text-sm text-neutral-500">Auditoria de alterações</p>
        </div>
        <a routerLink="/admin/services" class="btn-secondary">Voltar</a>
      </header>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (entries().length === 0) {
        <p class="py-12 text-center text-sm text-neutral-500">Nenhum registro de auditoria.</p>
      } @else {
        <ol class="space-y-3">
          @for (e of entries(); track e.id) {
            <li class="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
              <div class="flex items-center justify-between">
                <span class="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {{ actionLabel(e.action) }}
                </span>
                <span class="text-xs text-neutral-500">{{ e.createdAt | date: 'short' }}</span>
              </div>
              <p class="mt-2 text-xs text-neutral-500">Por {{ e.actorRole }} ({{ e.actorId }})</p>
              <pre class="mt-2 overflow-x-auto rounded bg-neutral-50 p-2 text-xs text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">{{ e.changedFields | json }}</pre>
            </li>
          }
        </ol>
      }
    </div>
  `,
})
export class ServiceAuditPage {
  private readonly catalog = inject(ServiceCatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly entries = signal<ServiceAuditEntry[]>([]);
  readonly loading = signal(true);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.catalog
      .getAudit(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.entries.set(list);
          this.loading.set(false);
        },
        error: (err) => {
          this.notify.error(err.message ?? 'Erro ao carregar histórico');
          this.loading.set(false);
        },
      });
  }

  actionLabel(action: ServiceAuditEntry['action']): string {
    const labels: Record<ServiceAuditEntry['action'], string> = {
      CREATED: 'Criado',
      UPDATED: 'Atualizado',
      DEACTIVATED: 'Inativado',
      REACTIVATED: 'Reativado',
    };
    return labels[action] ?? action;
  }
}
